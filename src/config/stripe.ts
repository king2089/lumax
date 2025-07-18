// Stripe Configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_live_51RgfeuBiSzaV56BFEmm4WYfIrmrZjxR8vkQf1jgksMpGOjlh7ZWncIldFqiEVbfWfTHAerRk77ALXzAjUouxchyG008WuiOuFU',
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
};

// Stripe price IDs for different subscription tiers
export const STRIPE_PRICE_IDS = {
  starter: {
    monthly: 'price_starter_monthly',
    yearly: 'price_starter_yearly',
  },
  premium: {
    monthly: 'price_premium_monthly',
    yearly: 'price_premium_yearly',
  },
  forever: {
    oneTime: 'price_forever_lifetime',
  },
};

// Stripe webhook events
export const STRIPE_WEBHOOK_EVENTS = {
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
};

// Helper function to check if we're in production
export const isProduction = () => STRIPE_CONFIG.environment === 'production';

// Helper function to get the appropriate Stripe key
export const getStripeKey = () => {
  if (isProduction()) {
    return STRIPE_CONFIG.publishableKey;
  }
  // For development, you might want to use test keys
  return STRIPE_CONFIG.publishableKey.replace('pk_live_', 'pk_test_');
}; 