#!/bin/bash

# Scienta Lab Chat - Secure Server Deployment Script
# This script handles the secure deployment of the application on the server

set -e

echo "🚀 Starting Scienta Lab Chat secure deployment..."

# Check if required environment variables are set
required_vars=(
    "GH_USERNAME"
    "OPENAI_API_KEY"
    "BIOMCP_URL"
    "BIO_MCP_SSE_PATH"
    "GHCR_PAT"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var environment variable is not set"
        exit 1
    fi
done

echo "✅ All required environment variables are set"

# Create secure .env file
echo "📝 Creating secure .env file..."
cat > .env << EOF
GH_USERNAME=${GH_USERNAME}
OPENAI_API_KEY=${OPENAI_API_KEY}
BIOMCP_URL=${BIOMCP_URL}
BIO_MCP_SSE_PATH=${BIO_MCP_SSE_PATH}
NODE_ENV=production
PORT=4001
HOST=0.0.0.0
CORS_ORIGIN=${CORS_ORIGIN:-https://scientalab.coulibalymamadou.com}
FRONTEND_URL=${FRONTEND_URL:-https://scientalab.coulibalymamadou.com}
API_URL=${API_URL:-https://api.scientalab.coulibalymamadou.com}
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://api.scientalab.coulibalymamadou.com}
NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL:-wss://api.scientalab.coulibalymamadou.com}
LOG_LEVEL=info
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
EOF

# Set secure permissions on .env file
chmod 600 .env
echo "🔒 Set secure permissions on .env file (600)"

# Login to GitHub Container Registry
echo "🔑 Logging in to GitHub Container Registry..."
echo "$GHCR_PAT" | docker login ghcr.io -u "$GH_USERNAME" --password-stdin

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker compose pull

# Deploy the application
echo "🚀 Deploying application..."
docker compose up -d --no-build

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
if docker compose ps | grep -q "Up"; then
    echo "✅ Services are running successfully"
else
    echo "❌ Some services failed to start"
    docker compose ps
    exit 1
fi

# Clean up old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

# Remove .env file for security
echo "🔒 Removing .env file for security..."
rm -f .env

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: https://scientalab.coulibalymamadou.com"
echo "🔌 API: https://api.scientalab.coulibalymamadou.com"
