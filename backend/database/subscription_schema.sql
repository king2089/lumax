-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  interval TEXT NOT NULL CHECK (interval IN ('day', 'week', 'month', 'year')),
  interval_count INTEGER DEFAULT 1,
  features TEXT, -- JSON array of features
  trial_days INTEGER DEFAULT 0,
  max_users INTEGER,
  max_storage INTEGER,
  max_api_calls INTEGER,
  stripe_price_id TEXT,
  is_popular BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
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
  metadata TEXT, -- JSON object for additional data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
);

-- Billing History Table
CREATE TABLE IF NOT EXISTS billing_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
  description TEXT,
  invoice_url TEXT,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Subscription Invoices Table
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  stripe_invoice_id TEXT UNIQUE,
  invoice_number TEXT UNIQUE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  invoice_url TEXT,
  due_date DATETIME,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price INTEGER NOT NULL, -- Amount in cents
  amount INTEGER NOT NULL, -- Amount in cents
  metadata TEXT, -- JSON object for additional data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES subscription_invoices (id) ON DELETE CASCADE
);

-- Subscription Usage Table
CREATE TABLE IF NOT EXISTS subscription_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  feature TEXT NOT NULL,
  usage INTEGER DEFAULT 0,
  limit_value INTEGER DEFAULT 1000,
  reset_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE(subscription_id, feature)
);

-- Subscription Metrics Table (for caching)
CREATE TABLE IF NOT EXISTS subscription_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  total_subscriptions INTEGER DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  monthly_recurring_revenue INTEGER DEFAULT 0,
  annual_recurring_revenue INTEGER DEFAULT 0,
  churn_rate REAL DEFAULT 0,
  average_revenue_per_user INTEGER DEFAULT 0,
  trial_conversion_rate REAL DEFAULT 0,
  last_calculated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_subscription_id ON billing_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON subscription_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON subscription_invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_subscription_id ON subscription_usage(subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_user_id ON subscription_usage(user_id);

-- Insert sample subscription plans
INSERT OR IGNORE INTO subscription_plans (
  name, description, price, currency, interval, interval_count, features, trial_days, is_popular, is_active
) VALUES 
(
  'Starter',
  'Perfect for individuals getting started',
  999, -- $9.99
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
  2999, -- $29.99
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
  9999, -- $99.99
  'usd',
  'month',
  1,
  '["All Pro features", "Unlimited users", "100GB storage", "Unlimited API calls", "24/7 support", "Custom integrations"]',
  30,
  0,
  1
),
(
  'Annual Pro',
  'Save 20% with annual billing',
  28790, -- $287.90 (20% off $359.88)
  'usd',
  'year',
  1,
  '["All Pro features", "Up to 5 users", "10GB storage", "1000 API calls/month", "Priority support"]',
  14,
  0,
  1
);

-- Create triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_subscription_plans_timestamp 
  AFTER UPDATE ON subscription_plans
  BEGIN
    UPDATE subscription_plans SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_subscriptions_timestamp 
  AFTER UPDATE ON subscriptions
  BEGIN
    UPDATE subscriptions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_subscription_usage_timestamp 
  AFTER UPDATE ON subscription_usage
  BEGIN
    UPDATE subscription_usage SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END; 