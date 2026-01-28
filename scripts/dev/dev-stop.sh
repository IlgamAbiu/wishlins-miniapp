#!/bin/bash

# Stop development environment

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Stopping development environment...${NC}"

docker-compose down

echo ""
echo -e "${GREEN}✓ All services stopped${NC}"
echo ""
echo -e "To start again: ${YELLOW}./dev.sh${NC}"
