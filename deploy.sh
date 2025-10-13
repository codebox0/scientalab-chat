#!/bin/bash

# Exit on error
set -e

echo "Starting Scienta Lab Chat deployment..."

# === Verify environment variables ===
echo "=== Verifying environment variables ==="
required_vars=(
    "SSH_KEY"
    "SSH_HOST"
    "SSH_USERNAME"
    "GHCR_PAT"
    "GH_USERNAME"
    "OPENAI_API_KEY"
    "BIOMCP_SERVER_URL"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set"
        exit 1
    fi
    echo "✓ $var is set"
done

# === Set up SSH key ===
echo "=== Setting up SSH key ==="
echo "$SSH_KEY" > deploy_key
chmod 600 deploy_key
echo "SSH key file created and permissions set"

# === Prepare local deploy directory ===
echo "=== Preparing local deploy directory ==="
mkdir -p deploy
cp docker-compose.yml deploy/
echo "Local deploy directory prepared"

# === Prepare server ===
echo "=== Preparing server ==="
ssh -i deploy_key -o StrictHostKeyChecking=no $SSH_USERNAME@$SSH_HOST "mkdir -p ~/scientalab-deploy"

# === Copy files to server ===
echo "=== Copying files to server ==="
scp -i deploy_key -r deploy/* $SSH_USERNAME@$SSH_HOST:~/scientalab-deploy/

# === Deploy on server ===
echo "=== Deploying on server ==="
ssh -i deploy_key $SSH_USERNAME@$SSH_HOST "cd ~/scientalab-deploy && \
    echo '$GHCR_PAT' | docker login ghcr.io -u $GH_USERNAME --password-stdin && \
    docker compose pull && \
    docker compose up -d --no-build"

# === Cleanup ===
echo "=== Cleaning up ==="
rm -rf deploy deploy_key

echo "=== Scienta Lab Chat deployment completed successfully ==="
echo "Frontend: https://scientalab.coulibalymamadou.com"
echo "API: https://api.scientalab.coulibalymamadou.com"