# Luma Card - Apple Pay & Google Pay Integration

A comprehensive mobile payment solution with Apple Pay and Google Pay integration, featuring a real backend API, secure payment processing, and account management.

## 🚀 Features

### Payment Processing
- **Apple Pay Integration** - Native iOS payment processing
- **Google Pay Integration** - Native Android payment processing
- **Real-time Transactions** - Live payment status updates
- **Secure Processing** - Stripe and Braintree integration
- **Webhook Support** - Real-time payment notifications

### Account Management
- **Multiple Payment Methods** - Add and manage multiple cards
- **Transaction History** - Complete payment and payout history
- **Payout System** - Request payouts to linked accounts
- **Fee Calculation** - Transparent fee structure
- **Credit Management** - Credit limits and available balance

### Security Features
- **JWT Authentication** - Secure API access
- **Rate Limiting** - Protection against abuse
- **Input Validation** - Comprehensive data validation
- **Error Handling** - Graceful error management
- **Audit Logging** - Complete transaction audit trail

## 📱 Mobile App Features

### Apple Pay & Google Pay Screen
- **Payment Processing** - Make payments with Apple Pay/Google Pay
- **Payout Requests** - Request payouts to linked accounts
- **Transaction History** - View all payment history
- **Payment Methods** - Manage linked payment methods
- **Real-time Updates** - Live balance and transaction updates

### User Experience
- **Native UI** - Platform-specific design patterns
- **Smooth Animations** - Polished user interactions
- **Error Handling** - User-friendly error messages
- **Loading States** - Clear feedback during processing
- **Offline Support** - Graceful offline handling

## 🏗️ Architecture

### Backend (Node.js/Express)
```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── env.example           # Environment configuration
├── luma_payments.db      # SQLite database
└── certs/                # SSL certificates
```

### Mobile App (React Native/Expo)
```
src/
├── screens/
│   └── ApplePayGooglePayScreen.tsx  # Main payment screen
├── services/
│   └── PaymentService.ts            # Payment API service
├── context/
│   └── LumaCardContext.tsx          # Card management
└── components/
    └── PaymentComponents.tsx        # Reusable components
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- React Native development environment
- Apple Developer Account (for Apple Pay)
- Google Pay API access (for Google Pay)
- Stripe account
- Braintree account

### Backend Setup

1. **Clone and Install**
```bash
cd backend
npm install
```

2. **Environment Configuration**
```bash
cp env.example .env
```

3. **Configure Environment Variables**
```env
# Server Configuration
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Apple Pay Configuration
APPLE_MERCHANT_ID=merchant.com.luma.card
APPLE_DOMAIN_NAME=yourdomain.com

# Google Pay Configuration
GOOGLE_MERCHANT_ID=your_google_merchant_id

# Braintree Configuration
BRAINTREE_MERCHANT_ID=your_braintree_merchant_id
BRAINTREE_PUBLIC_KEY=your_braintree_public_key
BRAINTREE_PRIVATE_KEY=your_braintree_private_key
```

4. **Start the Server**
```bash
npm run dev
```

### Mobile App Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
```bash
# Add to app.json or environment variables
EXPO_PUBLIC_API_URL=http://localhost:3001
```

3. **Start the App**
```bash
npx expo start
```

## 🔧 API Endpoints

### Apple Pay
- `GET /api/apple-pay/config` - Get Apple Pay configuration
- `POST /api/apple-pay/validate-session` - Validate Apple Pay session
- `POST /api/apple-pay/process-payment` - Process Apple Pay payment

### Google Pay
- `GET /api/google-pay/config` - Get Google Pay configuration
- `GET /api/google-pay/client-token` - Get Braintree client token
- `POST /api/google-pay/process-payment` - Process Google Pay payment

### Payment Methods
- `GET /api/payment-methods` - Get user's payment methods
- `POST /api/payment-methods` - Add payment method
- `PUT /api/payment-methods/:id/default` - Set default payment method
- `DELETE /api/payment-methods/:id` - Remove payment method

### Transactions & Payouts
- `GET /api/transactions` - Get transaction history
- `POST /api/payouts` - Request payout
- `GET /api/payouts` - Get payout history

## 🔐 Security Features

### Authentication
- JWT-based authentication
- Token refresh mechanism
- Secure token storage

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### Payment Security
- PCI DSS compliance
- Encrypted data transmission
- Secure payment processing
- Fraud detection

## 📊 Database Schema

### Users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Payment Methods
```sql
CREATE TABLE payment_methods (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT CHECK(type IN ('apple_pay', 'google_pay', 'card')),
  token TEXT,
  last_four TEXT,
  brand TEXT,
  is_default BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Transactions
```sql
CREATE TABLE transactions (
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Payouts
```sql
CREATE TABLE payouts (
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test Apple Pay config
curl http://localhost:3001/api/apple-pay/config

# Test Google Pay config
curl http://localhost:3001/api/google-pay/config
```

## 🚀 Deployment

### Backend Deployment
1. **Environment Setup**
   - Set production environment variables
   - Configure SSL certificates
   - Set up database (PostgreSQL/MySQL for production)

2. **Deploy to Platform**
   ```bash
   # Example: Deploy to Heroku
   heroku create luma-payments-api
   heroku config:set NODE_ENV=production
   git push heroku main
   ```

### Mobile App Deployment
1. **Build Configuration**
   - Configure production API endpoints
   - Set up code signing
   - Configure app store metadata

2. **App Store Deployment**
   ```bash
   # iOS
   eas build --platform ios
   
   # Android
   eas build --platform android
   ```

## 📈 Monitoring & Analytics

### Logging
- Winston logging framework
- Structured logging
- Error tracking with Sentry

### Metrics
- Payment success rates
- Transaction volumes
- Error rates
- Response times

### Alerts
- Payment failures
- High error rates
- System downtime
- Security incidents

## 🔄 Webhooks

### Stripe Webhooks
- Payment success/failure events
- Refund events
- Dispute events

### Braintree Webhooks
- Transaction settlement events
- Dispute events
- Subscription events

## 📞 Support

### Documentation
- API documentation
- Integration guides
- Troubleshooting guides

### Contact
- Technical support: support@luma.com
- Security issues: security@luma.com
- Business inquiries: business@luma.com

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Apple Pay integration
- ✅ Google Pay integration
- ✅ Basic payment processing
- ✅ Transaction history

### Phase 2 (Next)
- 🔄 PayPal integration
- 🔄 Crypto payments
- 🔄 International payments
- 🔄 Advanced analytics

### Phase 3 (Future)
- 📋 Subscription management
- 📋 Recurring payments
- 📋 Split payments
- 📋 Advanced fraud detection

---

**Built with ❤️ by the Luma Team** 