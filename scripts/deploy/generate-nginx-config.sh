#!/bin/bash

# Nginx configuration generator for Wishlins Mini App
# Usage: ./generate-nginx-config.sh your-domain.com

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}==>${NC} $1"
}

print_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

if [ -z "$1" ]; then
    print_error "Domain not provided"
    echo "Usage: ./generate-nginx-config.sh your-domain.com"
    exit 1
fi

DOMAIN=$1
CONFIG_FILE="nginx-${DOMAIN}.conf"

print_message "Generating Nginx configuration for ${DOMAIN}..."

cat > ${CONFIG_FILE} << EOF
# Nginx configuration for Wishlins Mini App
# Domain: ${DOMAIN}

server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/${DOMAIN}-access.log;
    error_log /var/log/nginx/${DOMAIN}-error.log;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket support (if needed in future)
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Increase timeouts for long requests
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }

    # API documentation (remove in production if not needed)
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /redoc {
        proxy_pass http://localhost:8000/redoc;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # OpenAPI schema
    location /openapi.json {
        proxy_pass http://localhost:8000/openapi.json;
        proxy_set_header Host \$host;
    }
}
EOF

print_message "Configuration generated: ${CONFIG_FILE}"
echo ""
echo "To deploy this configuration to your server:"
echo ""
echo "1. Copy to server:"
echo "   scp ${CONFIG_FILE} user@server:/tmp/${CONFIG_FILE}"
echo ""
echo "2. SSH to server and install:"
echo "   ssh user@server"
echo "   sudo mv /tmp/${CONFIG_FILE} /etc/nginx/sites-available/wishlins"
echo "   sudo ln -s /etc/nginx/sites-available/wishlins /etc/nginx/sites-enabled/"
echo "   sudo nginx -t"
echo "   sudo systemctl restart nginx"
echo ""
echo "3. Setup SSL certificate:"
echo "   sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
print_message "Done!"
