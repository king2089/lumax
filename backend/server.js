const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Payment processing libraries
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const braintree = require('braintree');

// Database (using SQLite for simplicity, can be replaced with PostgreSQL/MySQL)
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./luma_payments.db');

const app = express();
const PORT = process.env.PORT || 3001;

// Import routes
const preregistrationRoutes = require('./routes/preregistration');
const liveStreamingRoutes = require('./routes/liveStreaming');
const customerServiceRoutes = require('./routes/customerService');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:19006'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/preregistration', preregistrationRoutes);
app.use('/api/live-streaming', liveStreamingRoutes);
app.use('/api/customer-service', customerServiceRoutes);

// Initialize database
initializeDatabase();

// Apple Pay Configuration
const APPLE_PAY_CONFIG = {
  merchantId: process.env.APPLE_MERCHANT_ID,
  domainName: process.env.APPLE_DOMAIN_NAME,
  displayName: 'Luma Card',
  supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
  merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
  countryCode: 'US',
  currencyCode: 'USD'
};

// Google Pay Configuration
const GOOGLE_PAY_CONFIG = {
  environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST',
  merchantId: process.env.GOOGLE_MERCHANT_ID,
  merchantName: 'Luma Card',
  allowedPaymentMethods: [{
    type: 'CARD',
    parameters: {
      allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
      allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER']
    }
  }],
  transactionInfo: {
    totalPriceStatus: 'FINAL',
    totalPrice: '0.00',
    currencyCode: 'USD',
    countryCode: 'US'
  }
};

// Initialize Braintree for Google Pay
const braintreeGateway = braintree.connect({
  environment: process.env.NODE_ENV === 'production' ? braintree.Environment.Production : braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

// Database initialization
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      display_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Payment methods table
    db.run(`CREATE TABLE IF NOT EXISTS payment_methods (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      type TEXT CHECK(type IN ('apple_pay', 'google_pay', 'card')),
      token TEXT,
      last_four TEXT,
      brand TEXT,
      is_default BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Transactions table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      payment_method_id TEXT,
      amount INTEGER,
      currency TEXT DEFAULT 'USD',
      status TEXT CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
      type TEXT CHECK(type IN ('purchase', 'refund', 'payout')),
      description TEXT,
      merchant TEXT,
      reference TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (payment_method_id) REFERENCES payment_methods (id)
    )`);

    // Payouts table
    db.run(`CREATE TABLE IF NOT EXISTS payouts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      payment_method_id TEXT,
      amount INTEGER,
      currency TEXT DEFAULT 'USD',
      status TEXT CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
      fee INTEGER DEFAULT 0,
      net_amount INTEGER,
      reference TEXT,
      processed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (payment_method_id) REFERENCES payment_methods (id)
    )`);

    // Webhooks table
    db.run(`CREATE TABLE IF NOT EXISTS webhooks (
      id TEXT PRIMARY KEY,
      provider TEXT,
      event_type TEXT,
      payload TEXT,
      processed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Subscription Plans Table
    db.run(`CREATE TABLE IF NOT EXISTS subscription_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      currency TEXT DEFAULT 'usd',
      interval TEXT NOT NULL CHECK (interval IN ('day', 'week', 'month', 'year')),
      interval_count INTEGER DEFAULT 1,
      features TEXT,
      trial_days INTEGER DEFAULT 0,
      max_users INTEGER,
      max_storage INTEGER,
      max_api_calls INTEGER,
      stripe_price_id TEXT,
      is_popular BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // User Subscriptions Table
    db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id INTEGER NOT NULL,
      stripe_subscription_id TEXT UNIQUE,
      stripe_subscription_item_id TEXT,
      status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
      quantity INTEGER DEFAULT 1,
      current_period_start DATETIME,
      current_period_end DATETIME,
      cancel_at_period_end BOOLEAN DEFAULT 0,
      canceled_at DATETIME,
      trial_start DATETIME,
      trial_end DATETIME,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
    )`);

    // Billing History Table
    db.run(`CREATE TABLE IF NOT EXISTS billing_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subscription_id TEXT,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'usd',
      status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
      description TEXT,
      invoice_url TEXT,
      paid_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`);

    // Insert sample subscription plans
    db.run(`INSERT OR IGNORE INTO subscription_plans (
      name, description, price, currency, interval, interval_count, features, trial_days, is_popular, is_active
    ) VALUES 
    (
      'Starter',
      'Perfect for individuals getting started',
      999,
      'usd',
      'month',
      1,
      '["Basic features", "1 user", "1GB storage", "100 API calls/month"]',
      7,
      0,
      1
    ),
    (
      'Pro',
      'Great for growing teams and businesses',
      2999,
      'usd',
      'month',
      1,
      '["All Starter features", "Up to 5 users", "10GB storage", "1000 API calls/month", "Priority support"]',
      14,
      1,
      1
    ),
    (
      'Enterprise',
      'For large organizations with advanced needs',
      9999,
      'usd',
      'month',
      1,
      '["All Pro features", "Unlimited users", "100GB storage", "Unlimited API calls", "24/7 support", "Custom integrations"]',
      30,
      0,
      1
    )`);
  });
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Utility functions
function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

function centsToDollars(cents) {
  return (cents / 100).toFixed(2);
}

function dollarsToCents(dollars) {
  return Math.round(parseFloat(dollars) * 100);
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Apple Pay Routes

// Get Apple Pay configuration
app.get('/api/apple-pay/config', (req, res) => {
  res.json({
    merchantId: APPLE_PAY_CONFIG.merchantId,
    domainName: APPLE_PAY_CONFIG.domainName,
    displayName: APPLE_PAY_CONFIG.displayName,
    supportedNetworks: APPLE_PAY_CONFIG.supportedNetworks,
    merchantCapabilities: APPLE_PAY_CONFIG.merchantCapabilities,
    countryCode: APPLE_PAY_CONFIG.countryCode,
    currencyCode: APPLE_PAY_CONFIG.currencyCode
  });
});

// Validate Apple Pay session
app.post('/api/apple-pay/validate-session', authenticateToken, async (req, res) => {
  try {
    const { validationURL } = req.body;
    
    if (!validationURL) {
      return res.status(400).json({ error: 'Validation URL required' });
    }

    // In production, you would validate the session with Apple's servers
    // For now, we'll simulate a successful validation
    const sessionData = {
      epochTimestamp: Math.floor(Date.now() / 1000),
      expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      merchantSessionIdentifier: generateId(),
      nonce: crypto.randomBytes(32).toString('hex'),
      merchantIdentifier: APPLE_PAY_CONFIG.merchantId,
      domainName: APPLE_PAY_CONFIG.domainName,
      displayName: APPLE_PAY_CONFIG.displayName,
      signature: crypto.randomBytes(64).toString('hex')
    };

    res.json(sessionData);
  } catch (error) {
    console.error('Apple Pay session validation error:', error);
    res.status(500).json({ error: 'Failed to validate Apple Pay session' });
  }
});

// Process Apple Pay payment
app.post('/api/apple-pay/process-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentToken, amount, description, merchant } = req.body;
    const userId = req.user.id;

    if (!paymentToken || !amount) {
      return res.status(400).json({ error: 'Payment token and amount required' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: dollarsToCents(amount),
      currency: 'usd',
      payment_method_data: {
        type: 'card',
        card: {
          token: paymentToken
        }
      },
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      metadata: {
        userId,
        description,
        merchant,
        paymentMethod: 'apple_pay'
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Save transaction to database
      const transactionId = generateId();
      db.run(`
        INSERT INTO transactions (id, user_id, amount, status, type, description, merchant, reference, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        transactionId,
        userId,
        dollarsToCents(amount),
        'completed',
        'purchase',
        description,
        merchant,
        paymentIntent.id,
        JSON.stringify({ applePayToken: paymentToken })
      ]);

      res.json({
        success: true,
        transactionId,
        amount: centsToDollars(paymentIntent.amount),
        status: paymentIntent.status
      });
    } else {
      res.status(400).json({ error: 'Payment failed', status: paymentIntent.status });
    }
  } catch (error) {
    console.error('Apple Pay payment error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Google Pay Routes

// Get Google Pay configuration
app.get('/api/google-pay/config', (req, res) => {
  res.json({
    environment: GOOGLE_PAY_CONFIG.environment,
    merchantId: GOOGLE_PAY_CONFIG.merchantId,
    merchantName: GOOGLE_PAY_CONFIG.merchantName,
    allowedPaymentMethods: GOOGLE_PAY_CONFIG.allowedPaymentMethods,
    transactionInfo: GOOGLE_PAY_CONFIG.transactionInfo
  });
});

// Get Braintree client token for Google Pay
app.get('/api/google-pay/client-token', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Generate client token from Braintree
    const clientToken = await braintreeGateway.clientToken.generate({
      customerId: userId
    });

    res.json({ clientToken: clientToken.clientToken });
  } catch (error) {
    console.error('Braintree client token error:', error);
    res.status(500).json({ error: 'Failed to generate client token' });
  }
});

// Process Google Pay payment
app.post('/api/google-pay/process-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentMethodNonce, amount, description, merchant } = req.body;
    const userId = req.user.id;

    if (!paymentMethodNonce || !amount) {
      return res.status(400).json({ error: 'Payment method nonce and amount required' });
    }

    // Process payment with Braintree
    const result = await braintreeGateway.transaction.sale({
      amount: amount.toString(),
      paymentMethodNonce: paymentMethodNonce,
      customer: {
        id: userId
      },
      options: {
        submitForSettlement: true
      },
      customFields: {
        description: description,
        merchant: merchant
      }
    });

    if (result.success) {
      // Save transaction to database
      const transactionId = generateId();
      db.run(`
        INSERT INTO transactions (id, user_id, amount, status, type, description, merchant, reference, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        transactionId,
        userId,
        dollarsToCents(amount),
        'completed',
        'purchase',
        description,
        merchant,
        result.transaction.id,
        JSON.stringify({ googlePayNonce: paymentMethodNonce })
      ]);

      res.json({
        success: true,
        transactionId,
        amount: centsToDollars(result.transaction.amount * 100),
        status: result.transaction.status
      });
    } else {
      res.status(400).json({ 
        error: 'Payment failed', 
        message: result.message,
        status: result.transaction?.status 
      });
    }
  } catch (error) {
    console.error('Google Pay payment error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Payment Methods Management

// Get user's payment methods
app.get('/api/payment-methods', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.all(`
    SELECT id, type, last_four, brand, is_default, is_active, created_at
    FROM payment_methods 
    WHERE user_id = ? AND is_active = 1
    ORDER BY is_default DESC, created_at DESC
  `, [userId], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch payment methods' });
    }
    res.json(rows);
  });
});

// Add payment method
app.post('/api/payment-methods', authenticateToken, async (req, res) => {
  try {
    const { type, token, lastFour, brand } = req.body;
    const userId = req.user.id;

    if (!type || !token) {
      return res.status(400).json({ error: 'Payment method type and token required' });
    }

    const paymentMethodId = generateId();
    
    db.run(`
      INSERT INTO payment_methods (id, user_id, type, token, last_four, brand, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      paymentMethodId,
      userId,
      type,
      token,
      lastFour,
      brand,
      1 // Set as default if it's the first one
    ], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to add payment method' });
      }
      
      res.json({
        success: true,
        paymentMethodId,
        message: 'Payment method added successfully'
      });
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ error: 'Failed to add payment method' });
  }
});

// Set default payment method
app.put('/api/payment-methods/:id/default', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.run(`
    UPDATE payment_methods 
    SET is_default = CASE WHEN id = ? THEN 1 ELSE 0 END
    WHERE user_id = ?
  `, [id, userId], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update default payment method' });
    }
    
    res.json({ success: true, message: 'Default payment method updated' });
  });
});

// Remove payment method
app.delete('/api/payment-methods/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.run(`
    UPDATE payment_methods 
    SET is_active = 0 
    WHERE id = ? AND user_id = ?
  `, [id, userId], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to remove payment method' });
    }
    
    res.json({ success: true, message: 'Payment method removed' });
  });
});

// Transactions

// Get user's transactions
app.get('/api/transactions', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { limit = 50, offset = 0 } = req.query;
  
  db.all(`
    SELECT t.*, pm.type as payment_method_type, pm.last_four
    FROM transactions t
    LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
  `, [userId, limit, offset], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
    
    const transactions = rows.map(row => ({
      ...row,
      amount: centsToDollars(row.amount),
      metadata: row.metadata ? JSON.parse(row.metadata) : null
    }));
    
    res.json(transactions);
  });
});

// Payouts

// Request payout
app.post('/api/payouts', authenticateToken, async (req, res) => {
  try {
    const { amount, paymentMethodId } = req.body;
    const userId = req.user.id;

    if (!amount || !paymentMethodId) {
      return res.status(400).json({ error: 'Amount and payment method required' });
    }

    // Get payment method details
    db.get(`
      SELECT * FROM payment_methods WHERE id = ? AND user_id = ? AND is_active = 1
    `, [paymentMethodId, userId], async (err, paymentMethod) => {
      if (err || !paymentMethod) {
        return res.status(400).json({ error: 'Invalid payment method' });
      }

      const payoutId = generateId();
      const fee = Math.max(25, Math.round(dollarsToCents(amount) * 0.029)); // 2.9% + $0.25
      const netAmount = dollarsToCents(amount) - fee;

      // Create payout record
      db.run(`
        INSERT INTO payouts (id, user_id, payment_method_id, amount, fee, net_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        payoutId,
        userId,
        paymentMethodId,
        dollarsToCents(amount),
        fee,
        netAmount,
        'pending'
      ], async function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to create payout' });
        }

        // Process payout based on payment method type
        try {
          if (paymentMethod.type === 'apple_pay') {
            // Process Apple Pay payout (would integrate with Apple's payout API)
            await processApplePayPayout(payoutId, netAmount, paymentMethod);
          } else if (paymentMethod.type === 'google_pay') {
            // Process Google Pay payout (would integrate with Google's payout API)
            await processGooglePayPayout(payoutId, netAmount, paymentMethod);
          }

          res.json({
            success: true,
            payoutId,
            amount: centsToDollars(dollarsToCents(amount)),
            fee: centsToDollars(fee),
            netAmount: centsToDollars(netAmount),
            status: 'processing'
          });
        } catch (payoutError) {
          console.error('Payout processing error:', payoutError);
          res.status(500).json({ error: 'Payout processing failed' });
        }
      });
    });
  } catch (error) {
    console.error('Payout request error:', error);
    res.status(500).json({ error: 'Failed to request payout' });
  }
});

// Subscription Routes

// Get subscription plans
app.get('/api/subscriptions/plans', async (req, res) => {
  try {
    db.all('SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY price ASC', (err, plans) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch subscription plans' });
      }
      
      const formattedPlans = plans.map(plan => ({
        ...plan,
        features: JSON.parse(plan.features || '[]'),
        price: parseInt(plan.price),
        isPopular: Boolean(plan.is_popular),
        isActive: Boolean(plan.is_active)
      }));
      
      res.json(formattedPlans);
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

// Get user subscriptions
app.get('/api/subscriptions', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.all(`
    SELECT s.*, sp.name as plan_name, sp.description as plan_description
    FROM subscriptions s
    JOIN subscription_plans sp ON s.plan_id = sp.id
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC
  `, [userId], (err, subscriptions) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch user subscriptions' });
    }
    
    const formattedSubscriptions = subscriptions.map(sub => ({
      ...sub,
      currentPeriodStart: new Date(sub.current_period_start),
      currentPeriodEnd: new Date(sub.current_period_end),
      canceledAt: sub.canceled_at ? new Date(sub.canceled_at) : null,
      trialStart: sub.trial_start ? new Date(sub.trial_start) : null,
      trialEnd: sub.trial_end ? new Date(sub.trial_end) : null,
      createdAt: new Date(sub.created_at),
      updatedAt: new Date(sub.updated_at),
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
      metadata: JSON.parse(sub.metadata || '{}')
    }));
    
    res.json(formattedSubscriptions);
  });
});

// Create subscription
app.post('/api/subscriptions', authenticateToken, async (req, res) => {
  try {
    const { planId, paymentMethodId, quantity = 1 } = req.body;
    const userId = req.user.id;
    
    // Get plan details
    db.get('SELECT * FROM subscription_plans WHERE id = ? AND is_active = 1', [planId], async (err, plan) => {
      if (err || !plan) {
        return res.status(404).json({ error: 'Subscription plan not found' });
      }
      
      // Create subscription record
      const subscriptionId = generateId();
      const now = new Date();
      const trialEnd = plan.trial_days ? new Date(now.getTime() + plan.trial_days * 24 * 60 * 60 * 1000) : null;
      
      db.run(`
        INSERT INTO subscriptions (
          id, user_id, plan_id, status, quantity, current_period_start, 
          current_period_end, trial_start, trial_end, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        subscriptionId,
        userId,
        planId,
        plan.trial_days ? 'trialing' : 'active',
        quantity,
        now.toISOString(),
        new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        now.toISOString(),
        trialEnd ? trialEnd.toISOString() : null
      ], function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to create subscription' });
        }
        
        res.status(201).json({
          id: subscriptionId,
          userId,
          planId,
          status: plan.trial_days ? 'trialing' : 'active',
          quantity,
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          trialStart: now,
          trialEnd,
          createdAt: now,
          updatedAt: now,
          cancelAtPeriodEnd: false,
          metadata: {}
        });
      });
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Cancel subscription
app.post('/api/subscriptions/:id/cancel', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { cancelAtPeriodEnd = true } = req.body;
  const userId = req.user.id;
  
  db.run(`
    UPDATE subscriptions 
    SET cancel_at_period_end = ?, canceled_at = ?, updated_at = ?
    WHERE id = ? AND user_id = ?
  `, [cancelAtPeriodEnd, new Date().toISOString(), new Date().toISOString(), id, userId], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to cancel subscription' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    res.json({ success: true, message: 'Subscription cancelled successfully' });
  });
});

// Get billing history
app.get('/api/subscriptions/billing', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.all(`
    SELECT * FROM billing_history 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 50
  `, [userId], (err, billing) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch billing history' });
    }
    
    const formattedBilling = billing.map(bill => ({
      ...bill,
      amount: parseInt(bill.amount),
      paidAt: bill.paid_at ? new Date(bill.paid_at) : null,
      createdAt: new Date(bill.created_at)
    }));
    
    res.json(formattedBilling);
  });
});

// Get subscription metrics
app.get('/api/subscriptions/metrics', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.get(`
    SELECT 
      COUNT(*) as total_subscriptions,
      SUM(CASE WHEN status IN ('active', 'trialing') THEN 1 ELSE 0 END) as active_subscriptions
    FROM subscriptions 
    WHERE user_id = ?
  `, [userId], (err, metrics) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch metrics' });
    }
    
    res.json({
      totalSubscriptions: metrics.total_subscriptions || 0,
      activeSubscriptions: metrics.active_subscriptions || 0,
      monthlyRecurringRevenue: 0, // Placeholder
      annualRecurringRevenue: 0, // Placeholder
      churnRate: 0, // Placeholder
      averageRevenuePerUser: 0, // Placeholder
      trialConversionRate: 85.5 // Placeholder
    });
  });
});

// Get user's payouts
app.get('/api/payouts', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { limit = 50, offset = 0 } = req.query;
  
  db.all(`
    SELECT p.*, pm.type as payment_method_type, pm.last_four
    FROM payouts p
    LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `, [userId, limit, offset], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch payouts' });
    }
    
    const payouts = rows.map(row => ({
      ...row,
      amount: centsToDollars(row.amount),
      fee: centsToDollars(row.fee),
      netAmount: centsToDollars(row.netAmount)
    }));
    
    res.json(payouts);
  });
});

// Payout processing functions
async function processApplePayPayout(payoutId, amount, paymentMethod) {
  // In production, this would integrate with Apple's payout API
  console.log(`Processing Apple Pay payout: ${payoutId} for $${centsToDollars(amount)}`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Update payout status
  db.run(`
    UPDATE payouts 
    SET status = 'completed', processed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [payoutId]);
}

async function processGooglePayPayout(payoutId, amount, paymentMethod) {
  // In production, this would integrate with Google's payout API
  console.log(`Processing Google Pay payout: ${payoutId} for $${centsToDollars(amount)}`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Update payout status
  db.run(`
    UPDATE payouts 
    SET status = 'completed', processed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [payoutId]);
}

// Webhooks

// Stripe webhook
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Braintree webhook
app.post('/webhooks/braintree', (req, res) => {
  const webhookId = generateId();
  
  db.run(`
    INSERT INTO webhooks (id, provider, event_type, payload)
    VALUES (?, ?, ?, ?)
  `, [
    webhookId,
    'braintree',
    req.body.kind,
    JSON.stringify(req.body)
  ]);

  // Process webhook based on event type
  switch (req.body.kind) {
    case 'transaction_settled':
      console.log('Transaction settled:', req.body.transaction.id);
      break;
    case 'transaction_settlement_declined':
      console.log('Transaction settlement declined:', req.body.transaction.id);
      break;
    default:
      console.log(`Unhandled Braintree webhook: ${req.body.kind}`);
  }

  res.json({ received: true });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Luma Payments API server running on port ${PORT}`);
  console.log(`📱 Apple Pay Merchant ID: ${APPLE_PAY_CONFIG.merchantId}`);
  console.log(`🤖 Google Pay Environment: ${GOOGLE_PAY_CONFIG.environment}`);
});

module.exports = app; 