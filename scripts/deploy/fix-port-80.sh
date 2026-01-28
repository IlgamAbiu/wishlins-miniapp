#!/bin/bash
# Script to diagnose and fix port 80 conflict

echo "==> Checking what's using port 80..."
sudo lsof -i :80 || sudo netstat -tulpn | grep :80

echo ""
echo "==> Stopping old Docker containers..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

echo ""
echo "==> Checking if Nginx is running on host..."
sudo systemctl status nginx 2>/dev/null || sudo service nginx status 2>/dev/null || echo "Nginx service not found"

echo ""
echo "Options to fix:"
echo "1. Stop Nginx on host: sudo systemctl stop nginx"
echo "2. Use different port in docker-compose.prod.yml (e.g., 8080:80)"
echo "3. Use Nginx as reverse proxy (recommended for production)"
