#!/bin/bash

# Quick start script for first-time deployment
# This script should be run ON THE SERVER after cloning the repository
# Usage: ./quick-start.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
}

print_message() {
    echo -e "${GREEN}==>${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

print_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

ask_yes_no() {
    while true; do
        read -p "$1 (y/n): " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes (y) or no (n).";;
        esac
    done
}

print_header "Wishlins Mini App - Quick Start Setup"

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "docker-compose.prod.yml not found. Are you in the project directory?"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    echo "Run: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed."
    exit 1
fi

print_message "Docker and Docker Compose are installed ✓"

# Step 1: Configure environment
print_header "Step 1: Environment Configuration"

if [ ! -f ".env" ]; then
    print_message "Creating .env file from template..."
    cp .env.example .env

    echo ""
    print_warning "Please configure the following variables in .env file:"
    echo ""
    echo "Required variables:"
    echo "  - TELEGRAM_BOT_TOKEN: Your bot token from @BotFather"
    echo "  - MINIAPP_URL: Your domain (https://your-domain.com)"
    echo "  - VITE_API_URL: Your API URL (https://your-domain.com/api/v1)"
    echo "  - POSTGRES_PASSWORD: Strong password for PostgreSQL"
    echo "  - CORS_ORIGINS: Your domain in JSON array format"
    echo ""

    if ask_yes_no "Do you want to edit .env now?"; then
        ${EDITOR:-nano} .env
    else
        print_warning "Don't forget to edit .env before starting the application!"
        exit 0
    fi
else
    print_message ".env file already exists"
    if ask_yes_no "Do you want to review/edit it?"; then
        ${EDITOR:-nano} .env
    fi
fi

# Validate required environment variables
print_message "Validating environment variables..."

source .env

if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ "$TELEGRAM_BOT_TOKEN" = "your_bot_token_here" ]; then
    print_error "TELEGRAM_BOT_TOKEN is not set in .env"
    exit 1
fi

if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "change_this_to_strong_password" ]; then
    print_error "POSTGRES_PASSWORD is not set in .env"
    exit 1
fi

print_message "Environment configuration looks good ✓"

# Step 2: Build and start containers
print_header "Step 2: Building and Starting Containers"

print_message "This may take a few minutes on first run..."

if docker compose -f docker-compose.prod.yml up -d --build; then
    print_message "Containers started successfully ✓"
else
    print_error "Failed to start containers"
    exit 1
fi

# Step 3: Wait for services to be ready
print_header "Step 3: Waiting for Services to Start"

print_message "Waiting for PostgreSQL to be ready..."
sleep 10

MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_message "PostgreSQL is ready ✓"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
    sleep 1
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    print_error "PostgreSQL failed to start"
    exit 1
fi

# Step 4: Run database migrations
print_header "Step 4: Running Database Migrations"

if docker compose -f docker-compose.prod.yml exec -T backend alembic upgrade head; then
    print_message "Database migrations completed ✓"
else
    print_error "Failed to run migrations"
    exit 1
fi

# Step 5: Check services status
print_header "Step 5: Verifying Services"

print_message "Container status:"
docker compose -f docker-compose.prod.yml ps

echo ""
print_message "Checking API health..."
sleep 5

if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_message "Backend API is healthy ✓"
else
    print_warning "Backend API health check failed"
fi

# Step 6: Display next steps
print_header "Deployment Successful! 🎉"

echo ""
echo "Your application is now running!"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure Nginx:"
echo "   ./generate-nginx-config.sh your-domain.com"
echo ""
echo "2. Setup SSL certificate:"
echo "   sudo certbot --nginx -d your-domain.com"
echo ""
echo "3. Configure Telegram Bot Mini App button:"
echo "   - Open @BotFather"
echo "   - Send /setmenubutton"
echo "   - Set URL to: https://your-domain.com"
echo ""
echo "4. Test your bot:"
echo "   - Open your bot in Telegram"
echo "   - Send /start"
echo "   - Click the menu button"
echo ""
echo "Useful commands:"
echo "  - View logs: docker compose -f docker-compose.prod.yml logs -f"
echo "  - Restart: docker compose -f docker-compose.prod.yml restart"
echo "  - Stop: docker compose -f docker-compose.prod.yml down"
echo "  - Check status: ./check-status.sh"
echo ""
echo "Full documentation: DEPLOYMENT.md"
echo "Command reference: CHEATSHEET.md"
echo ""
print_message "Happy coding! 🚀"
