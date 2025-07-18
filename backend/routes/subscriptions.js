const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticateToken } = require('../middleware/auth');
const db = require('../database');

// Subscription Plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await db.all(`
      SELECT * FROM subscription_plans 
      WHERE is_active = 1 
      ORDER BY price ASC
    `);
    
    res.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

router.post('/plans', authenticateToken, async (req, res) => {
  try {
    const { name, description, price, currency, interval, intervalCount, features, trialDays } = req.body;
    
    const result = await db.run(`
      INSERT INTO subscription_plans (
        name, description, price, currency, interval, interval_count, 
        features, trial_days, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
    `, [name, description, price, currency, interval, intervalCount, JSON.stringify(features), trialDays]);
    
    const plan = await db.get('SELECT * FROM subscription_plans WHERE id = ?', [result.lastID]);
    res.status(201).json(plan);
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    res.status(500).json({ error: 'Failed to create subscription plan' });
  }
});

router.put('/plans/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`)
      .join(', ');
    
    const values = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => {
        const value = updates[key];
        return typeof value === 'object' ? JSON.stringify(value) : value;
      });
    
    values.push(id);
    
    await db.run(`UPDATE subscription_plans SET ${setClause}, updated_at = datetime('now') WHERE id = ?`, values);
    
    const plan = await db.get('SELECT * FROM subscription_plans WHERE id = ?', [id]);
    res.json(plan);
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({ error: 'Failed to update subscription plan' });
  }
});

router.delete('/plans/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.run('UPDATE subscription_plans SET is_active = 0, updated_at = datetime("now") WHERE id = ?', [id]);
    
    res.json({ message: 'Subscription plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    res.status(500).json({ error: 'Failed to delete subscription plan' });
  }
});

// User Subscriptions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const subscriptions = await db.all(`
      SELECT s.*, sp.name as plan_name, sp.description as plan_description
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `, [req.user.id]);
    
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch user subscriptions' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { planId, paymentMethodId, quantity = 1 } = req.body;
    
    // Get plan details
    const plan = await db.get('SELECT * FROM subscription_plans WHERE id = ? AND is_active = 1', [planId]);
    if (!plan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }
    
    // Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: req.user.stripe_customer_id,
      items: [{ price: plan.stripe_price_id, quantity }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: plan.trial_days || undefined,
    });
    
    // Save to database
    const result = await db.run(`
      INSERT INTO subscriptions (
        user_id, plan_id, stripe_subscription_id, status, quantity,
        current_period_start, current_period_end, trial_start, trial_end,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      req.user.id,
      planId,
      stripeSubscription.id,
      stripeSubscription.status,
      quantity,
      new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000).toISOString() : null,
      stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
    ]);
    
    const subscription = await db.get(`
      SELECT s.*, sp.name as plan_name, sp.description as plan_description
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.id = ?
    `, [result.lastID]);
    
    res.status(201).json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { planId, quantity } = req.body;
    
    const subscription = await db.get('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Update Stripe subscription
    if (planId) {
      const plan = await db.get('SELECT * FROM subscription_plans WHERE id = ?', [planId]);
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        items: [{ id: subscription.stripe_subscription_item_id, price: plan.stripe_price_id }],
      });
    }
    
    if (quantity) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        items: [{ id: subscription.stripe_subscription_item_id, quantity }],
      });
    }
    
    // Update database
    const updates = [];
    const values = [];
    
    if (planId) {
      updates.push('plan_id = ?');
      values.push(planId);
    }
    
    if (quantity) {
      updates.push('quantity = ?');
      values.push(quantity);
    }
    
    if (updates.length > 0) {
      updates.push('updated_at = datetime("now")');
      values.push(id);
      
      await db.run(`UPDATE subscriptions SET ${updates.join(', ')} WHERE id = ?`, values);
    }
    
    const updatedSubscription = await db.get(`
      SELECT s.*, sp.name as plan_name, sp.description as plan_description
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.id = ?
    `, [id]);
    
    res.json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelAtPeriodEnd = true } = req.body;
    
    const subscription = await db.get('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Cancel Stripe subscription
    if (cancelAtPeriodEnd) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    } else {
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    }
    
    // Update database
    await db.run(`
      UPDATE subscriptions 
      SET cancel_at_period_end = ?, canceled_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `, [cancelAtPeriodEnd, id]);
    
    const updatedSubscription = await db.get(`
      SELECT s.*, sp.name as plan_name, sp.description as plan_description
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.id = ?
    `, [id]);
    
    res.json(updatedSubscription);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

router.post('/:id/reactivate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscription = await db.get('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Reactivate Stripe subscription
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
    });
    
    // Update database
    await db.run(`
      UPDATE subscriptions 
      SET cancel_at_period_end = 0, canceled_at = NULL, updated_at = datetime('now')
      WHERE id = ?
    `, [id]);
    
    const updatedSubscription = await db.get(`
      SELECT s.*, sp.name as plan_name, sp.description as plan_description
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.id = ?
    `, [id]);
    
    res.json(updatedSubscription);
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
});

// Billing History
router.get('/billing', authenticateToken, async (req, res) => {
  try {
    const billing = await db.all(`
      SELECT * FROM billing_history 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [req.user.id]);
    
    res.json(billing);
  } catch (error) {
    console.error('Error fetching billing history:', error);
    res.status(500).json({ error: 'Failed to fetch billing history' });
  }
});

router.get('/:id/billing', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const billing = await db.all(`
      SELECT * FROM billing_history 
      WHERE subscription_id = ? AND user_id = ?
      ORDER BY created_at DESC
    `, [id, req.user.id]);
    
    res.json(billing);
  } catch (error) {
    console.error('Error fetching subscription billing:', error);
    res.status(500).json({ error: 'Failed to fetch subscription billing' });
  }
});

// Invoices
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const invoices = await db.all(`
      SELECT * FROM subscription_invoices 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [req.user.id]);
    
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

router.get('/:id/invoices', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoices = await db.all(`
      SELECT * FROM subscription_invoices 
      WHERE subscription_id = ? AND user_id = ?
      ORDER BY created_at DESC
    `, [id, req.user.id]);
    
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching subscription invoices:', error);
    res.status(500).json({ error: 'Failed to fetch subscription invoices' });
  }
});

router.get('/invoices/:invoiceId', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const invoice = await db.get(`
      SELECT * FROM subscription_invoices 
      WHERE id = ? AND user_id = ?
    `, [invoiceId, req.user.id]);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Get invoice items
    const items = await db.all(`
      SELECT * FROM invoice_items 
      WHERE invoice_id = ?
    `, [invoiceId]);
    
    invoice.items = items;
    
    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Usage Tracking
router.get('/:id/usage', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const usage = await db.all(`
      SELECT * FROM subscription_usage 
      WHERE subscription_id = ? AND user_id = ?
      ORDER BY created_at DESC
    `, [id, req.user.id]);
    
    res.json(usage);
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

router.post('/:id/usage', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { feature, usage } = req.body;
    
    const subscription = await db.get('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Get or create usage record
    let usageRecord = await db.get(`
      SELECT * FROM subscription_usage 
      WHERE subscription_id = ? AND feature = ? AND user_id = ?
    `, [id, feature, req.user.id]);
    
    if (usageRecord) {
      // Update existing usage
      await db.run(`
        UPDATE subscription_usage 
        SET usage = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [usage, usageRecord.id]);
    } else {
      // Create new usage record
      const result = await db.run(`
        INSERT INTO subscription_usage (
          subscription_id, user_id, feature, usage, limit_value, reset_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `, [id, req.user.id, feature, usage, 1000, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()]);
      
      usageRecord = await db.get('SELECT * FROM subscription_usage WHERE id = ?', [result.lastID]);
    }
    
    res.json(usageRecord);
  } catch (error) {
    console.error('Error reporting usage:', error);
    res.status(500).json({ error: 'Failed to report usage' });
  }
});

// Metrics
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    // Get subscription metrics
    const metrics = await db.get(`
      SELECT 
        COUNT(*) as total_subscriptions,
        SUM(CASE WHEN status IN ('active', 'trialing') THEN 1 ELSE 0 END) as active_subscriptions,
        AVG(CASE WHEN status IN ('active', 'trialing') THEN 1 ELSE 0 END) * 100 as churn_rate
      FROM subscriptions 
      WHERE user_id = ?
    `, [req.user.id]);
    
    // Calculate revenue metrics (simplified)
    const revenue = await db.get(`
      SELECT 
        SUM(amount) as total_revenue,
        AVG(amount) as average_revenue_per_user
      FROM billing_history 
      WHERE user_id = ? AND status = 'paid'
    `, [req.user.id]);
    
    res.json({
      totalSubscriptions: metrics.total_subscriptions || 0,
      activeSubscriptions: metrics.active_subscriptions || 0,
      monthlyRecurringRevenue: revenue.total_revenue || 0,
      annualRecurringRevenue: (revenue.total_revenue || 0) * 12,
      churnRate: metrics.churn_rate || 0,
      averageRevenuePerUser: revenue.average_revenue_per_user || 0,
      trialConversionRate: 85.5, // Placeholder
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Webhooks
router.post('/webhooks', async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

// Webhook handlers
async function handleSubscriptionCreated(subscription) {
  // Update subscription status in database
  await db.run(`
    UPDATE subscriptions 
    SET status = ?, updated_at = datetime('now')
    WHERE stripe_subscription_id = ?
  `, [subscription.status, subscription.id]);
}

async function handleSubscriptionUpdated(subscription) {
  // Update subscription in database
  await db.run(`
    UPDATE subscriptions 
    SET status = ?, current_period_start = ?, current_period_end = ?, updated_at = datetime('now')
    WHERE stripe_subscription_id = ?
  `, [
    subscription.status,
    new Date(subscription.current_period_start * 1000).toISOString(),
    new Date(subscription.current_period_end * 1000).toISOString(),
    subscription.id
  ]);
}

async function handleSubscriptionDeleted(subscription) {
  // Mark subscription as canceled in database
  await db.run(`
    UPDATE subscriptions 
    SET status = 'canceled', canceled_at = datetime('now'), updated_at = datetime('now')
    WHERE stripe_subscription_id = ?
  `, [subscription.id]);
}

async function handleInvoicePaymentSucceeded(invoice) {
  // Record successful payment
  const subscription = await db.get('SELECT * FROM subscriptions WHERE stripe_subscription_id = ?', [invoice.subscription]);
  
  if (subscription) {
    await db.run(`
      INSERT INTO billing_history (
        subscription_id, user_id, amount, currency, status, description, paid_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [
      subscription.id,
      subscription.user_id,
      invoice.amount_paid,
      invoice.currency,
      'paid',
      `Payment for ${invoice.subscription}`,
    ]);
  }
}

async function handleInvoicePaymentFailed(invoice) {
  // Record failed payment
  const subscription = await db.get('SELECT * FROM subscriptions WHERE stripe_subscription_id = ?', [invoice.subscription]);
  
  if (subscription) {
    await db.run(`
      INSERT INTO billing_history (
        subscription_id, user_id, amount, currency, status, description, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      subscription.id,
      subscription.user_id,
      invoice.amount_due,
      invoice.currency,
      'failed',
      `Failed payment for ${invoice.subscription}`,
    ]);
  }
}

module.exports = router; 