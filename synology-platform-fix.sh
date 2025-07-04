#!/bin/bash

# Synology Platform Fix - Pull Correct Architecture Images
# Run this on Synology after building multi-platform images locally

set -e

echo "🔧 QRLinkr Platform Architecture Fix"
echo "====================================="

cd /volume1/docker/qrlinkr

BACKEND_IMAGE="ghcr.io/asjadaugust/qrlinkr/backend:latest"
FRONTEND_IMAGE="ghcr.io/asjadaugust/qrlinkr/frontend:latest"

echo "🛑 Stopping containers..."
docker-compose -f docker-compose.synology-hostnet.yml down

echo ""
echo "🧹 Cleaning up wrong architecture images..."
# Remove the ARM64 images that don't work on this x86 Synology
docker images | grep qrlinkr | awk '{print $3}' | xargs -r docker rmi -f
docker system prune -f
echo "   ✅ Old images removed"

echo ""
echo "📥 Pulling correct architecture images..."
echo "   Backend: $BACKEND_IMAGE"
docker pull --platform linux/amd64 "$BACKEND_IMAGE"
echo "   ✅ Backend (amd64) pulled successfully"

echo ""
echo "   Frontend: $FRONTEND_IMAGE"
docker pull --platform linux/amd64 "$FRONTEND_IMAGE"
echo "   ✅ Frontend (amd64) pulled successfully"

echo ""
echo "🔍 Verifying image architecture..."
BACKEND_ARCH=$(docker inspect "$BACKEND_IMAGE" --format='{{.Architecture}}')
echo "   Backend architecture: $BACKEND_ARCH"

if [ "$BACKEND_ARCH" = "amd64" ]; then
    echo "   ✅ Correct architecture confirmed!"
else
    echo "   ⚠️  Unexpected architecture: $BACKEND_ARCH"
fi

echo ""
echo "🚀 Starting containers with correct images..."
docker-compose -f docker-compose.synology-hostnet.yml --env-file .env.synology-hostnet up -d

echo ""
echo "📊 Container status:"
docker-compose -f docker-compose.synology-hostnet.yml ps

echo ""
echo "🔍 Monitoring backend startup (should work now)..."
echo "   EXPECT: 'Server ready at http://0.0.0.0:3001'"
echo "   NO MORE: 'exec format error' or 'Cannot use import statement outside a module'"
echo ""
echo "Press Ctrl+C to stop monitoring..."
echo ""

sleep 5
docker-compose -f docker-compose.synology-hostnet.yml logs -f backend
