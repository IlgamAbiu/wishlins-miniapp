#!/bin/bash

# Development environment startup script
# This script starts all services in development mode with hot reload

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Wishlist Mini App - Development Environment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env and add your TELEGRAM_BOT_TOKEN${NC}"
    exit 1
fi

echo -e "${GREEN}✓ .env file found${NC}"

# Stop existing containers
echo ""
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true

# Start services
echo ""
echo -e "${BLUE}Starting services...${NC}"
docker-compose up -d

# Wait for database to be ready
echo ""
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
sleep 5

# Run migrations
echo ""
echo -e "${BLUE}Running database migrations...${NC}"
docker-compose exec -T backend alembic upgrade head

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Services are running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Frontend (Vite):    ${BLUE}http://localhost:5173${NC}"
echo -e "Backend API:        ${BLUE}http://localhost:8000${NC}"
echo -e "API Documentation:  ${BLUE}http://localhost:8000/docs${NC}"
echo -e "PostgreSQL:         ${BLUE}localhost:5432${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  View logs:         ${BLUE}docker-compose logs -f${NC}"
echo -e "  View specific:     ${BLUE}docker-compose logs -f [frontend|backend|bot]${NC}"
echo -e "  Stop services:     ${BLUE}docker-compose down${NC}"
echo -e "  Restart service:   ${BLUE}docker-compose restart [service_name]${NC}"
echo ""
echo -e "${GREEN}Hot reload is enabled for all services!${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to view logs (or run: docker-compose logs -f)${NC}"
echo ""

# Follow logs
docker-compose logs -f
