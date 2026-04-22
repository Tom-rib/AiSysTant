#!/bin/bash
# AiSystant Development Environment Setup Script

set -e

echo "🚀 AiSystant Development Setup"
echo "================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+"
    exit 1
fi

echo "✅ Node.js $(node --version)"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Optional but recommended for database."
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
cd backend && npm install --legacy-peer-deps && cd ..
cd frontend && npm install --legacy-peer-deps && cd ..

# Create env files if they don't exist
echo ""
echo "🔑 Setting up environment files..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "⚠️  Created backend/.env - Please update with your values"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "⚠️  Created frontend/.env - Please update with your values"
fi

# Create database (if using Docker)
echo ""
echo "🐘 Setting up database..."
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    docker-compose up -d postgres 2>/dev/null || true
    echo "✅ PostgreSQL container started (or already running)"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with ANTHROPIC_API_KEY"
echo "2. Update DATABASE_URL if needed"
echo "3. Run: make dev"
echo ""
