#!/bin/bash

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  🚀 Crypto Trading Platform - Quick Start           ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is installed
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✓ Docker found"
    echo ""
    echo "Starting services with Docker..."
    echo ""

    docker-compose up -d

    echo ""
    echo "Waiting for services to start..."
    sleep 5

    echo ""
    echo "Running database migrations..."
    docker-compose exec -T backend npm run db:migrate

    echo ""
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║  ✓ Platform is running!                              ║"
    echo "║                                                       ║"
    echo "║  Frontend:  http://localhost:3002                    ║"
    echo "║  Backend:   http://localhost:3000                    ║"
    echo "║  WebSocket: http://localhost:3001                    ║"
    echo "║                                                       ║"
    echo "║  View logs: docker-compose logs -f                   ║"
    echo "║  Stop:      docker-compose down                      ║"
    echo "╚═══════════════════════════════════════════════════════╝"
else
    echo "⚠ Docker not found. Please install Docker or follow manual setup."
    echo ""
    echo "Manual setup instructions:"
    echo "1. cd backend && npm install && npm run db:migrate && npm run dev"
    echo "2. cd frontend && npm install && npm run dev"
    echo ""
    echo "See QUICKSTART.md for detailed instructions."
fi
