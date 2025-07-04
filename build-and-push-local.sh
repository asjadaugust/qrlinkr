#!/bin/bash

# Local Docker Build and Push Script
# Build QRLinkr images locally to avoid Synology disk space issues

set -e

echo "🔨 Building QRLinkr Docker Images Locally"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Please run this script from the QRLinkr project root directory"
    exit 1
fi

# Registry configuration
REGISTRY="ghcr.io/asjadaugust/qrlinkr"
BACKEND_IMAGE="$REGISTRY/backend:latest"
FRONTEND_IMAGE="$REGISTRY/frontend:latest"

echo "📋 Images to build:"
echo "   Backend:  $BACKEND_IMAGE"
echo "   Frontend: $FRONTEND_IMAGE"
echo ""

# Check Docker login
echo "🔐 Checking Docker registry login..."
if docker info | grep -q "Username:"; then
    echo "   ✅ Already logged in to Docker registry"
else
    echo "   ⚠️  Please login to GitHub Container Registry first:"
    echo "   echo 'YOUR_GITHUB_TOKEN' | docker login ghcr.io -u asjadaugust --password-stdin"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " continue_anyway
    if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
        exit 1
    fi
fi

echo ""
echo "🔨 Setting up multi-platform builder..."
docker buildx create --name multiarch --use --bootstrap || docker buildx use multiarch
echo "   ✅ Multi-platform builder ready"

echo ""
echo "🔨 Building backend image for multiple platforms..."
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -f backend/Dockerfile \
    -t "$BACKEND_IMAGE" \
    --push \
    .
echo "   ✅ Backend image built and pushed for amd64 + arm64"

echo ""
echo "🔨 Building frontend image for multiple platforms..."
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -f frontend/Dockerfile \
    -t "$FRONTEND_IMAGE" \
    --push \
    .
echo "   ✅ Frontend image built and pushed for amd64 + arm64"

echo ""
echo "🎉 SUCCESS! Multi-platform images built and pushed."
echo ""
echo "📋 Next steps for Synology:"
echo "   1. SSH into your Synology"
echo "   2. cd /volume1/docker/qrlinkr"
echo "   3. docker-compose -f docker-compose.synology-hostnet.yml down"
echo "   4. docker system prune -f  # Clean old images"
echo "   5. docker pull $BACKEND_IMAGE"
echo "   6. docker pull $FRONTEND_IMAGE"
echo "   7. docker-compose -f docker-compose.synology-hostnet.yml --env-file .env.synology-hostnet up -d"
echo ""
echo "✅ Both architecture mismatch AND ES module errors should be resolved!"
