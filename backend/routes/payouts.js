const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');

// Stripe Instant Payout to Card
router.post('/card', async (req, res) => {
  try {
    const { cardToken, amount } = req.body;
    // Create a Stripe connected account or use your platform account
    // For demo, create an external account (card) and payout
    const customer = await stripe.customers.create({
      source: cardToken,
      description: 'Payout recipient',
    });
    // Create an instant payout to the card
    const payout = await stripe.payouts.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'usd',
      method: 'instant',
      destination: customer.default_source,
      statement_descriptor: 'Luma Instant Pay',
    });
    res.json({ success: true, payout });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Stripe Bank Account Payout
router.post('/bank', async (req, res) => {
  try {
    const { account, routing, amount } = req.body;
    // For demo: create an external bank account token
    const bankToken = await stripe.tokens.create({
      bank_account: {
        country: 'US',
        currency: 'usd',
        account_holder_name: 'Luma User',
        account_holder_type: 'individual',
        routing_number: routing,
        account_number: account,
      },
    });
    // Attach to a customer or payout directly
    const customer = await stripe.customers.create({
      source: bankToken.id,
      description: 'Bank payout recipient',
    });
    const payout = await stripe.payouts.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'usd',
      destination: customer.default_source,
      statement_descriptor: 'Luma Bank Pay',
    });
    res.json({ success: true, payout });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// PayPal Payout
router.post('/paypal', async (req, res) => {
  try {
    const { email, amount } = req.body;
    // You need to configure PayPal SDK and credentials
    // For demo, just return success
    res.json({ success: true, message: 'PayPal payout (mocked)' });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Apple Pay (mock)
router.post('/applepay', async (req, res) => {
  res.json({ success: true, message: 'Apple Pay payout (mocked)' });
});

// Google Pay (mock)
router.post('/googlepay', async (req, res) => {
  res.json({ success: true, message: 'Google Pay payout (mocked)' });
});

module.exports = router; 