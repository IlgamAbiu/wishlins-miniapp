#!/bin/bash

# Deployment script for Wishlins Mini App
# Usage: ./deploy.sh [server_user@server_ip]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="wishlins-miniapp"
PROJECT_DIR="~/apps/${PROJECT_NAME}"
COMPOSE_FILE="docker-compose.prod.yml"

# Function to print colored messages
print_message() {
    echo -e "${GREEN}==>${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

print_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

# Check if server argument is provided
if [ -z "$1" ]; then
    print_error "Server address not provided"
    echo "Usage: ./deploy.sh user@server_ip"
    exit 1
fi

SERVER=$1

print_message "Starting deployment to ${SERVER}..."

# Deploy to server
ssh ${SERVER} << 'ENDSSH'
set -e

cd ~/apps/wishlins-miniapp || {
    echo "Project directory not found. Please clone the repository first."
    exit 1
}

echo "Pulling latest changes..."
git pull origin main

echo "Stopping existing containers..."
docker compose -f docker-compose.prod.yml down

echo "Building and starting containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo "Waiting for services to start..."
sleep 10

echo "Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T backend alembic upgrade head

echo "Checking container status..."
docker compose -f docker-compose.prod.yml ps

echo "Deployment completed successfully!"
ENDSSH

if [ $? -eq 0 ]; then
    print_message "Deployment completed successfully!"
    print_message "Check your application at your domain"
else
    print_error "Deployment failed!"
    exit 1
fi
