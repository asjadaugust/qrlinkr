#!/bin/bash

# Comprehensive Docker Image Verification and Force Refresh
# This will verify if we're getting the correct image and force a refresh if needed

set -e

echo "🔍 COMPREHENSIVE QRLinkr Image Verification & Fix"
echo "=================================================="

cd /volume1/docker/qrlinkr

BACKEND_IMAGE="ghcr.io/asjadaugust/qrlinkr/backend:latest"
FRONTEND_IMAGE="ghcr.io/asjadaugust/qrlinkr/frontend:latest"

echo "Step 1: Checking GitHub Container Registry..."
echo "   Attempting to pull backend image..."

if docker pull "$BACKEND_IMAGE"; then
    echo "   ✅ Backend image pull successful"
    
    # Check the image creation time
    CREATION_TIME=$(docker inspect "$BACKEND_IMAGE" | grep '"Created"' | head -1)
    echo "   📅 Image creation time: $CREATION_TIME"
    
    # Most importantly - check if the image has the ES module fix
    echo ""
    echo "Step 2: Verifying ES module fix in the image..."
    echo "   Checking package.json content..."
    
    PACKAGE_JSON=$(docker run --rm "$BACKEND_IMAGE" cat /app/package.json 2>/dev/null || echo "ERROR: Could not read package.json")
    
    if [[ "$PACKAGE_JSON" == *'"type": "module"'* ]]; then
        echo "   ✅ SUCCESS: Image contains ES module fix!"
        echo "   🎉 The Docker image has the correct package.json"
        
        echo ""
        echo "Step 3: Starting containers with VERIFIED good image..."
        docker-compose -f docker-compose.synology-hostnet.yml down
        docker-compose -f docker-compose.synology-hostnet.yml --env-file .env.synology-hostnet up -d
        
        echo ""
        echo "Step 4: Monitoring startup (should work now)..."
        sleep 5
        docker-compose -f docker-compose.synology-hostnet.yml logs --tail=20 backend
        
    else
        echo "   ❌ PROBLEM: Image does NOT contain ES module fix!"
        echo "   📄 Image package.json content:"
        echo "$PACKAGE_JSON" | head -10
        echo ""
        echo "   🚨 This means GitHub Actions didn't build properly!"
        echo "   🔧 Need to manually build and push the image..."
        
        # Provide manual build instructions
        echo ""
        echo "MANUAL BUILD REQUIRED:"
        echo "Run this on your local machine (not Synology):"
        echo ""
        echo "  cd /path/to/qrlinkr"
        echo "  echo 'YOUR_GITHUB_TOKEN' | docker login ghcr.io -u asjadaugust --password-stdin"
        echo "  docker build -f backend/Dockerfile -t $BACKEND_IMAGE ."
        echo "  docker push $BACKEND_IMAGE"
        echo ""
        echo "Then re-run this script."
    fi
    
else
    echo "   ❌ Backend image pull FAILED"
    echo "   🚨 Registry access problem or image doesn't exist"
    echo ""
    echo "Possible causes:"
    echo "   1. GitHub Actions build failed"
    echo "   2. Repository permissions issue"
    echo "   3. Registry path incorrect"
    echo ""
    echo "Check GitHub Actions at: https://github.com/asjadaugust/qrlinkr/actions"
fi

echo ""
echo "Current container status:"
docker-compose -f docker-compose.synology-hostnet.yml ps
