#!/bin/bash

# Production deployment script

echo "🚀 Starting deployment process..."

# Check if required environment variables are set
if [ -z "$STRIPE_SECRET_KEY" ] || [ -z "$STRIPE_PUBLISHABLE_KEY" ]; then
    echo "❌ Error: STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY must be set"
    echo "Please set these environment variables before deploying"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run security audit
echo "🔍 Running security audit..."
npm audit --audit-level moderate

# Set production environment
export NODE_ENV=production

# Start the server
echo "🎯 Starting production server..."
echo "Portfolio will be available at: http://localhost:${PORT:-3000}"
npm start