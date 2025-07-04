#!/bin/bash

# QRLinkr Synology Update Script - Pull Latest Fixed Images
# Run this after GitHub Actions has built the new images with ES module fixes

set -e

echo "🔄 QRLinkr Synology Update - Pulling Latest Images"
echo "==============================================="

# Navigate to the project directory
cd /volume1/docker/qrlinkr

# Stop current containers
echo "1. Stopping current containers..."
docker-compose -f docker-compose.synology-hostnet.yml down

# Pull latest images from GitHub Container Registry
echo "2. Pulling latest backend image..."
docker pull ghcr.io/$GITHUB_REPOSITORY_OWNER/qrlinkr/backend:latest

echo "3. Pulling latest frontend image..."
docker pull ghcr.io/$GITHUB_REPOSITORY_OWNER/qrlinkr/frontend:latest

# Start containers with new images
echo "4. Starting containers with updated images..."
docker-compose -f docker-compose.synology-hostnet.yml --env-file .env.synology-hostnet up -d

# Show status
echo "5. Checking container status..."
docker-compose -f docker-compose.synology-hostnet.yml ps

echo ""
echo "✅ Update complete! Monitoring backend logs..."
echo "The ES module configuration should now be fixed."
echo ""

# Follow backend logs to confirm success
docker-compose -f docker-compose.synology-hostnet.yml logs -f backend
