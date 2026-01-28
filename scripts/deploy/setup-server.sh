#!/bin/bash

# Initial server setup script for Wishlins Mini App
# Usage: ./setup-server.sh user@server_ip

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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
    echo "Usage: ./setup-server.sh user@server_ip"
    exit 1
fi

SERVER=$1

print_message "Setting up server ${SERVER}..."

# Setup commands to run on server
ssh ${SERVER} << 'ENDSSH'
set -e

echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    sudo usermod -aG docker $USER
    echo "Docker installed successfully"
else
    echo "Docker is already installed"
fi

echo "Installing Docker Compose plugin..."
sudo apt install -y docker-compose-plugin

echo "Installing Git..."
sudo apt install -y git

echo "Installing Nginx..."
sudo apt install -y nginx

echo "Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

echo "Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "Creating project directory..."
mkdir -p ~/apps

echo "Server setup completed!"
echo ""
echo "IMPORTANT: Log out and log back in for Docker group changes to take effect"
echo "Then run: git clone <your-repo-url> ~/apps/wishlins-miniapp"
ENDSSH

if [ $? -eq 0 ]; then
    print_message "Server setup completed successfully!"
    echo ""
    print_warning "Next steps:"
    echo "1. Log out and log back in to the server"
    echo "2. Clone your repository: ssh ${SERVER} 'git clone <your-repo-url> ~/apps/wishlins-miniapp'"
    echo "3. Configure .env file on the server"
    echo "4. Run: ./deploy.sh ${SERVER}"
else
    print_error "Server setup failed!"
    exit 1
fi
