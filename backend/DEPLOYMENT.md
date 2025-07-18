# Luma Payments API - Deployment Guide

This guide covers the complete deployment of the Luma Payments API with Apple Pay, Google Pay, and subscription management.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- SSL certificates (for production)
- Payment processor accounts (Stripe, Braintree)

### 1. Environment Setup

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Apple Pay Configuration
APPLE_MERCHANT_ID=merchant.com.luma.payments
APPLE_DOMAIN_NAME=api.luma.com

# Google Pay Configuration
GOOGLE_MERCHANT_ID=12345678901234567890

# Braintree Configuration
BRAINTREE_MERCHANT_ID=your_merchant_id
BRAINTREE_PUBLIC_KEY=your_public_key
BRAINTREE_PRIVATE_KEY=your_private_key

# Database Configuration
DB_USER=luma
DB_PASSWORD=secure_password_here

# Monitoring
GRAFANA_PASSWORD=admin_password_here
```

### 2. SSL Certificates

For production, place your SSL certificates in the `certs/` directory:

```bash
mkdir certs
# Copy your certificate files:
# - certs/certificate.pem
# - certs/private-key.pem
```

### 3. Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f luma-payments-api
```

### 4. Database Initialization

The database will be automatically initialized with sample data. To manually run migrations:

```bash
# Access the database container
docker-compose exec luma-payments-api sqlite3 luma_payments.db

# Or run the deployment script
chmod +x deploy.sh
./deploy.sh migrate
```

## 📊 Monitoring & Observability

### Prometheus Metrics

The API exposes metrics at `/metrics` endpoint:

- **Request Count**: Total API requests
- **Response Time**: API response latency
- **Error Rate**: Failed request percentage
- **Payment Success Rate**: Successful payment transactions
- **Subscription Metrics**: Active subscriptions, churn rate

### Grafana Dashboards

Access Grafana at `http://localhost:3000` (default: admin/admin):

1. **API Performance Dashboard**
   - Request rate and latency
   - Error rates and status codes
   - Database query performance

2. **Payment Analytics Dashboard**
   - Transaction volume and success rates
   - Revenue metrics
   - Payment method distribution

3. **Subscription Dashboard**
   - Active subscriptions
   - Churn rate and retention
   - Revenue per user

### Health Checks

The API includes health check endpoints:

- `GET /health` - Basic health status
- `GET /health/detailed` - Detailed system status
- `GET /metrics` - Prometheus metrics

## 🔧 Configuration

### Nginx Configuration

The Nginx reverse proxy provides:

- SSL termination
- Rate limiting
- Load balancing
- Security headers
- CORS handling

Key configuration files:
- `nginx.conf` - Main configuration
- `certs/` - SSL certificates

### Rate Limiting

Configured limits:
- API endpoints: 10 requests/second
- Webhook endpoints: 5 requests/second
- Burst allowance: 20 requests

### Security Headers

Nginx adds security headers:
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content Security Policy

## 🗄️ Database Management

### Backup Strategy

Automated backups are configured in `deploy.sh`:

```bash
# Manual backup
./deploy.sh backup

# Restore from backup
docker-compose exec postgres psql -U luma -d luma_payments < backup_file.sql
```

### Database Schema

Key tables:
- `users` - User accounts
- `payment_methods` - Apple Pay, Google Pay, cards
- `transactions` - Payment transactions
- `payouts` - Payout records
- `subscription_plans` - Available plans
- `subscriptions` - User subscriptions
- `billing_history` - Payment history

## 🔄 Deployment Workflow

### Automated Deployment

Use the deployment script for automated deployments:

```bash
# Deploy to production
./deploy.sh deploy v1.0.0 production

# Rollback if needed
./deploy.sh rollback

# Health check
./deploy.sh health

# Run tests
./deploy.sh test
```

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          ssh user@server "cd /app && git pull && ./deploy.sh deploy ${{ github.ref_name }} production"
```

## 🚨 Troubleshooting

### Common Issues

1. **SSL Certificate Errors**
   ```bash
   # Check certificate validity
   openssl x509 -in certs/certificate.pem -text -noout
   ```

2. **Database Connection Issues**
   ```bash
   # Check database status
   docker-compose exec postgres pg_isready -U luma
   ```

3. **Payment Processing Errors**
   ```bash
   # Check Stripe webhook logs
   docker-compose logs -f luma-payments-api | grep stripe
   ```

### Log Analysis

```bash
# View all logs
docker-compose logs -f

# Filter by service
docker-compose logs -f luma-payments-api

# Search for errors
docker-compose logs | grep -i error
```

### Performance Monitoring

```bash
# Check resource usage
docker stats

# Monitor API performance
curl -s http://localhost:3001/metrics | grep api_requests_total
```

## 🔐 Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use secrets management in production
- Rotate JWT secrets regularly

### Network Security
- Use VPN for database access
- Implement IP whitelisting
- Monitor for suspicious activity

### Payment Security
- PCI DSS compliance for payment data
- Encrypt sensitive data at rest
- Use secure communication protocols

## 📈 Scaling

### Horizontal Scaling

Add more API instances:

```yaml
# docker-compose.yml
services:
  luma-payments-api:
    deploy:
      replicas: 3
```

### Database Scaling

For high traffic, consider:
- Read replicas for PostgreSQL
- Redis clustering
- Database sharding

### Load Balancing

Nginx automatically load balances between API instances. Monitor with:

```bash
# Check load balancer status
curl http://localhost/nginx_status
```

## 🆘 Support

### Monitoring Alerts

Configure alerts for:
- High error rates (>5%)
- Response time >2s
- Database connection failures
- Payment processing failures

### Emergency Procedures

1. **Service Outage**
   ```bash
   # Restart services
   docker-compose restart
   
   # Check health
   ./deploy.sh health
   ```

2. **Database Issues**
   ```bash
   # Restore from backup
   ./deploy.sh backup
   ```

3. **Security Incident**
   - Rotate all secrets
   - Review access logs
   - Update SSL certificates

## 📚 Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Apple Pay Integration Guide](https://developer.apple.com/apple-pay/)
- [Google Pay API Reference](https://developers.google.com/pay/api)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prometheus Monitoring](https://prometheus.io/docs/)
- [Grafana Dashboards](https://grafana.com/docs/)

---

For additional support, contact the development team or create an issue in the repository. 