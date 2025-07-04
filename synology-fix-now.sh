#!/bin/bash

# QRLinkr Immediate Fix - Check GitHub Status and Update Images
# Run this on your Synology NAS to pull the latest fixed Docker images

set -e

echo "🔍 QRLinkr Container Update Status Check"
echo "========================================"

# Navigate to the project directory
cd /volume1/docker/qrlinkr

echo "Current time: $(date)"
echo ""

# Check current backend image timestamp
echo "1. Current backend image info:"
docker images | grep qrlinkr/backend || echo "No qrlinkr/backend image found"
echo ""

# Check if containers are running
echo "2. Current container status:"
docker-compose -f docker-compose.synology-hostnet.yml ps
echo ""

# Try to pull latest images
echo "3. Attempting to pull latest images..."

# First, let's check what registry we're actually pulling from
echo "   Checking registry access..."
if [ -z "$GITHUB_REPOSITORY_OWNER" ]; then
    echo "   ⚠️  GITHUB_REPOSITORY_OWNER not set, using fallback..."
    # Try common registry paths
    REGISTRIES=(
        "ghcr.io/klm95441/qrlinkr/backend:latest"
        "ghcr.io/qrlinkr/backend:latest" 
        "qrlinkr/backend:latest"
    )
    
    for registry in "${REGISTRIES[@]}"; do
        echo "   Trying: $registry"
        if docker pull "$registry"; then
            echo "   ✅ Backend image updated from $registry"
            BACKEND_SUCCESS=true
            break
        else
            echo "   ❌ Failed: $registry"
        fi
    done
    
    if [ "$BACKEND_SUCCESS" != "true" ]; then
        echo "   ⚠️  All backend registries failed"
    fi
else
    echo "   Backend from: ghcr.io/$GITHUB_REPOSITORY_OWNER/qrlinkr/backend:latest"
    if docker pull ghcr.io/$GITHUB_REPOSITORY_OWNER/qrlinkr/backend:latest; then
        echo "   ✅ Backend image updated successfully"
    else
        echo "   ⚠️  Backend image pull failed - may still be building"
    fi
fi

echo "   Frontend:"
if docker pull ghcr.io/$GITHUB_REPOSITORY_OWNER/qrlinkr/frontend:latest; then
    echo "   ✅ Frontend image updated successfully"
else
    echo "   ⚠️  Frontend image pull failed - may still be building"
fi

echo ""
echo "4. New image timestamps after pull:"
docker images | grep qrlinkr/backend

echo ""
echo "5. Restarting containers with updated images..."
docker-compose -f docker-compose.synology-hostnet.yml down
docker-compose -f docker-compose.synology-hostnet.yml --env-file .env.synology-hostnet up -d

echo ""
echo "6. Container status after restart:"
docker-compose -f docker-compose.synology-hostnet.yml ps

echo ""
echo "🔍 Monitoring backend logs for ES module fix..."
echo "   Look for: '🚀 Server ready at http://0.0.0.0:3001'"
echo "   NO MORE: 'Cannot use import statement outside a module'"
echo ""
echo "Press Ctrl+C to stop monitoring..."
echo ""

# Follow logs
docker-compose -f docker-compose.synology-hostnet.yml logs -f backend
