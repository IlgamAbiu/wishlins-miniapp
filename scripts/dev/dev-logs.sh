#!/bin/bash

# View logs for development environment

SERVICE=$1

if [ -z "$SERVICE" ]; then
    echo "Viewing logs for all services (press Ctrl+C to stop)"
    echo ""
    docker-compose logs -f
else
    echo "Viewing logs for $SERVICE (press Ctrl+C to stop)"
    echo ""
    docker-compose logs -f "$SERVICE"
fi
