#!/bin/bash

# Restart a specific service or all services

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVICE=$1

if [ -z "$SERVICE" ]; then
    echo -e "${YELLOW}Restarting all services...${NC}"
    docker-compose restart
    echo ""
    echo -e "${GREEN}✓ All services restarted${NC}"
else
    echo -e "${YELLOW}Restarting $SERVICE...${NC}"
    docker-compose restart "$SERVICE"
    echo ""
    echo -e "${GREEN}✓ $SERVICE restarted${NC}"
    echo ""
    echo -e "View logs: ${BLUE}./dev-logs.sh $SERVICE${NC}"
fi
