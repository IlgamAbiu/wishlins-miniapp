#!/bin/bash

# Health check script for Wishlins Mini App
# Usage: ./check-status.sh [user@server_ip]

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

print_header() {
    echo ""
    echo -e "${GREEN}=== $1 ===${NC}"
}

if [ -z "$1" ]; then
    # Local check
    print_header "Checking Local Deployment"

    print_header "Docker Containers Status"
    docker compose -f docker-compose.prod.yml ps

    print_header "Container Health"
    BACKEND_STATUS=$(docker compose -f docker-compose.prod.yml ps backend --format json | grep -o '"State":"[^"]*"' | cut -d'"' -f4)
    BOT_STATUS=$(docker compose -f docker-compose.prod.yml ps bot --format json | grep -o '"State":"[^"]*"' | cut -d'"' -f4)
    FRONTEND_STATUS=$(docker compose -f docker-compose.prod.yml ps frontend --format json | grep -o '"State":"[^"]*"' | cut -d'"' -f4)
    POSTGRES_STATUS=$(docker compose -f docker-compose.prod.yml ps postgres --format json | grep -o '"State":"[^"]*"' | cut -d'"' -f4)

    [ "$BACKEND_STATUS" = "running" ] && print_success "Backend: Running" || print_error "Backend: $BACKEND_STATUS"
    [ "$BOT_STATUS" = "running" ] && print_success "Bot: Running" || print_error "Bot: $BOT_STATUS"
    [ "$FRONTEND_STATUS" = "running" ] && print_success "Frontend: Running" || print_error "Frontend: $FRONTEND_STATUS"
    [ "$POSTGRES_STATUS" = "running" ] && print_success "PostgreSQL: Running" || print_error "PostgreSQL: $POSTGRES_STATUS"

    print_header "API Health Check"
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        print_success "Backend API is responding"
    else
        print_error "Backend API is not responding"
    fi

    print_header "Recent Logs"
    echo "Backend logs (last 10 lines):"
    docker compose -f docker-compose.prod.yml logs --tail=10 backend

    echo ""
    echo "Bot logs (last 10 lines):"
    docker compose -f docker-compose.prod.yml logs --tail=10 bot

else
    # Remote check
    SERVER=$1
    print_header "Checking Remote Deployment on ${SERVER}"

    ssh ${SERVER} << 'ENDSSH'
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo ""
    echo -e "${GREEN}=== $1 ===${NC}"
}

cd ~/apps/wishlins-miniapp

print_header "Git Status"
git log -1 --oneline

print_header "Docker Containers Status"
docker compose -f docker-compose.prod.yml ps

print_header "Container Health"
BACKEND_RUNNING=$(docker compose -f docker-compose.prod.yml ps -q backend | wc -l)
BOT_RUNNING=$(docker compose -f docker-compose.prod.yml ps -q bot | wc -l)
FRONTEND_RUNNING=$(docker compose -f docker-compose.prod.yml ps -q frontend | wc -l)
POSTGRES_RUNNING=$(docker compose -f docker-compose.prod.yml ps -q postgres | wc -l)

[ "$BACKEND_RUNNING" -gt 0 ] && print_success "Backend: Running" || print_error "Backend: Not running"
[ "$BOT_RUNNING" -gt 0 ] && print_success "Bot: Running" || print_error "Bot: Not running"
[ "$FRONTEND_RUNNING" -gt 0 ] && print_success "Frontend: Running" || print_error "Frontend: Not running"
[ "$POSTGRES_RUNNING" -gt 0 ] && print_success "PostgreSQL: Running" || print_error "PostgreSQL: Not running"

print_header "API Health Check"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    print_success "Backend API is responding"
else
    print_error "Backend API is not responding"
fi

print_header "Disk Usage"
df -h /var/lib/docker

print_header "Memory Usage"
free -h

print_header "Recent Errors (Backend)"
docker compose -f docker-compose.prod.yml logs --tail=20 backend | grep -i error || echo "No errors found"

print_header "Recent Errors (Bot)"
docker compose -f docker-compose.prod.yml logs --tail=20 bot | grep -i error || echo "No errors found"

ENDSSH
fi

echo ""
print_success "Status check completed!"
