#!/bin/bash

# AGGRESSIVE Docker Image Update - Force Fresh Pull
# This script will force a complete refresh of Docker images

set -e

echo "🚨 AGGRESSIVE QRLinkr Image Update"
echo "=================================="
echo "This will FORCE pull the latest images and remove old cached versions"
echo ""

# Navigate to the project directory
cd /volume1/docker/qrlinkr

# Use the CORRECT registry path
BACKEND_IMAGE="ghcr.io/asjadaugust/qrlinkr/backend:latest"
FRONTEND_IMAGE="ghcr.io/asjadaugust/qrlinkr/frontend:latest"

echo "1. Stopping all containers..."
docker-compose -f docker-compose.synology-hostnet.yml down

echo ""
echo "2. REMOVING OLD IMAGES (this forces fresh pull)..."
docker images | grep qrlinkr | awk '{print $3}' | xargs -r docker rmi -f
echo "   ✅ Old QRLinkr images removed"

echo ""
echo "3. FORCING fresh pull of latest images..."
echo "   Backend: $BACKEND_IMAGE"
docker pull --no-cache "$BACKEND_IMAGE"
echo "   ✅ Backend image pulled fresh"

echo ""
echo "   Frontend: $FRONTEND_IMAGE"
docker pull --no-cache "$FRONTEND_IMAGE"
echo "   ✅ Frontend image pulled fresh"

echo ""
echo "4. Verifying NEW image details..."
echo "   Backend created:"
docker inspect "$BACKEND_IMAGE" | grep '"Created"' | head -1

echo ""
echo "5. Starting containers with FRESH images..."
docker-compose -f docker-compose.synology-hostnet.yml --env-file .env.synology-hostnet up -d

echo ""
echo "6. Container status:"
docker-compose -f docker-compose.synology-hostnet.yml ps

echo ""
echo "🔍 Monitoring backend startup..."
echo "   EXPECT: 'Server ready at http://0.0.0.0:3001'"
echo "   NO MORE: 'Cannot use import statement outside a module'"
echo ""
echo "Press Ctrl+C to stop monitoring..."
echo ""

# Wait for startup
sleep 5

# Follow logs
docker-compose -f docker-compose.synology-hostnet.yml logs -f backend
