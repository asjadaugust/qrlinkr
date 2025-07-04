#!/bin/bash

# QRLinkr FIXED Update Script - Correct Registry Path
# Run this on your Synology NAS to pull the correct Docker images

set -e

echo "🔍 QRLinkr Container Update - FIXED REGISTRY"
echo "=============================================="

# Navigate to the project directory
cd /volume1/docker/qrlinkr

echo "Current time: $(date)"
echo ""

# Use the CORRECT registry path based on your GitHub repo
BACKEND_IMAGE="ghcr.io/asjadaugust/qrlinkr/backend:latest"
FRONTEND_IMAGE="ghcr.io/asjadaugust/qrlinkr/frontend:latest"

echo "1. Current backend image info:"
docker images | grep qrlinkr/backend || echo "No qrlinkr/backend image found"
echo ""

echo "2. Current container status:"
docker-compose -f docker-compose.synology-hostnet.yml ps
echo ""

echo "3. Pulling from CORRECT registry..."
echo "   Backend: $BACKEND_IMAGE"
if docker pull "$BACKEND_IMAGE"; then
    echo "   ✅ Backend image updated successfully!"
    
    # Check the image timestamp to confirm it's new
    echo "   📅 Image created:"
    docker inspect "$BACKEND_IMAGE" | grep '"Created"' | head -1
    
else
    echo "   ❌ Backend image pull failed"
    echo "   This usually means GitHub Actions hasn't finished building yet"
    echo "   Check: https://github.com/asjadaugust/qrlinkr/actions"
    exit 1
fi

echo ""
echo "   Frontend: $FRONTEND_IMAGE"
if docker pull "$FRONTEND_IMAGE"; then
    echo "   ✅ Frontend image updated successfully!"
else
    echo "   ⚠️  Frontend image pull failed (continuing anyway)"
fi

echo ""
echo "4. Stopping old containers..."
docker-compose -f docker-compose.synology-hostnet.yml down

echo ""
echo "5. Starting with NEW images..."
docker-compose -f docker-compose.synology-hostnet.yml --env-file .env.synology-hostnet up -d

echo ""
echo "6. Container status after restart:"
docker-compose -f docker-compose.synology-hostnet.yml ps

echo ""
echo "🔍 Monitoring backend logs..."
echo "   ✅ EXPECT: 'Server ready at http://0.0.0.0:3001'"
echo "   ❌ NO MORE: 'Cannot use import statement outside a module'"
echo ""
echo "Press Ctrl+C to stop monitoring..."
echo ""

# Wait a moment for containers to start
sleep 3

# Follow logs
docker-compose -f docker-compose.synology-hostnet.yml logs -f backend
