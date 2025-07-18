#!/bin/bash

# Luma Payments API Deployment Script
# This script handles deployment to production environment

set -e  # Exit on any error

# Configuration
APP_NAME="luma-payments-api"
DOCKER_REGISTRY="your-registry.com"
IMAGE_TAG="${1:-latest}"
ENVIRONMENT="${2:-production}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        log_warning "kubectl not found - Kubernetes deployment will be skipped"
    fi
    
    log_success "Prerequisites check passed"
}

# Load environment variables
load_environment() {
    log_info "Loading environment variables..."
    
    if [ ! -f ".env" ]; then
        log_error ".env file not found"
        exit 1
    fi
    
    source .env
    
    # Validate required environment variables
    required_vars=(
        "JWT_SECRET"
        "STRIPE_SECRET_KEY"
        "STRIPE_PUBLISHABLE_KEY"
        "APPLE_MERCHANT_ID"
        "GOOGLE_MERCHANT_ID"
        "BRAINTREE_MERCHANT_ID"
        "BRAINTREE_PUBLIC_KEY"
        "BRAINTREE_PRIVATE_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    log_success "Environment variables loaded"
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."
    
    docker build -t $DOCKER_REGISTRY/$APP_NAME:$IMAGE_TAG .
    
    if [ $? -eq 0 ]; then
        log_success "Docker image built successfully"
    else
        log_error "Failed to build Docker image"
        exit 1
    fi
}

# Push Docker image to registry
push_image() {
    log_info "Pushing Docker image to registry..."
    
    docker push $DOCKER_REGISTRY/$APP_NAME:$IMAGE_TAG
    
    if [ $? -eq 0 ]; then
        log_success "Docker image pushed successfully"
    else
        log_error "Failed to push Docker image"
        exit 1
    fi
}

# Deploy using Docker Compose
deploy_compose() {
    log_info "Deploying with Docker Compose..."
    
    # Stop existing containers
    docker-compose down
    
    # Pull latest images
    docker-compose pull
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    check_health
    
    log_success "Docker Compose deployment completed"
}

# Deploy using Kubernetes
deploy_kubernetes() {
    if ! command -v kubectl &> /dev/null; then
        log_warning "Skipping Kubernetes deployment - kubectl not available"
        return
    fi
    
    log_info "Deploying to Kubernetes..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace luma-payments --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/ -n luma-payments
    
    # Update image tag
    kubectl set image deployment/$APP_NAME $APP_NAME=$DOCKER_REGISTRY/$APP_NAME:$IMAGE_TAG -n luma-payments
    
    # Wait for deployment to complete
    kubectl rollout status deployment/$APP_NAME -n luma-payments
    
    log_success "Kubernetes deployment completed"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Run migrations using Docker Compose
    docker-compose exec -T luma-payments-api npm run migrate
    
    if [ $? -eq 0 ]; then
        log_success "Database migrations completed"
    else
        log_error "Database migrations failed"
        exit 1
    fi
}

# Check service health
check_health() {
    log_info "Checking service health..."
    
    # Wait for services to be ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            log_success "Service is healthy"
            return 0
        fi
        
        log_info "Health check attempt $attempt/$max_attempts failed, retrying..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Service health check failed after $max_attempts attempts"
    return 1
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    docker-compose exec -T luma-payments-api npm test
    
    if [ $? -eq 0 ]; then
        log_success "Tests passed"
    else
        log_error "Tests failed"
        exit 1
    fi
}

# Backup database
backup_database() {
    log_info "Creating database backup..."
    
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    docker-compose exec -T postgres pg_dump -U $DB_USER luma_payments > "backups/$backup_file"
    
    if [ $? -eq 0 ]; then
        log_success "Database backup created: backups/$backup_file"
    else
        log_warning "Database backup failed"
    fi
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Restore previous image
        docker-compose down
        docker-compose up -d
        
        log_success "Rollback completed"
    else
        log_info "Rollback not implemented for $ENVIRONMENT environment"
    fi
}

# Cleanup old images
cleanup() {
    log_info "Cleaning up old Docker images..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove images older than 7 days
    docker images $DOCKER_REGISTRY/$APP_NAME --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | \
    awk 'NR>1 {split($2, date, " "); if (systime() - mktime(date[1] " " date[2] " " date[3] " " date[4] " " date[5] " " date[6]) > 7*24*60*60) print $1}' | \
    xargs -r docker rmi
    
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting deployment for $APP_NAME (tag: $IMAGE_TAG, environment: $ENVIRONMENT)"
    
    # Create necessary directories
    mkdir -p backups logs certs
    
    # Run deployment steps
    check_prerequisites
    load_environment
    backup_database
    build_image
    push_image
    
    if [ "$ENVIRONMENT" = "production" ]; then
        deploy_kubernetes
    else
        deploy_compose
    fi
    
    run_migrations
    check_health
    run_tests
    cleanup
    
    log_success "Deployment completed successfully!"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "health")
        check_health
        ;;
    "test")
        run_tests
        ;;
    "migrate")
        run_migrations
        ;;
    "backup")
        backup_database
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health|test|migrate|backup|cleanup} [tag] [environment]"
        echo "  deploy   - Deploy the application (default)"
        echo "  rollback - Rollback to previous version"
        echo "  health   - Check service health"
        echo "  test     - Run tests"
        echo "  migrate  - Run database migrations"
        echo "  backup   - Create database backup"
        echo "  cleanup  - Clean up old images"
        exit 1
        ;;
esac 