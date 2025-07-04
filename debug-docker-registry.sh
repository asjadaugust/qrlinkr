#!/bin/bash

# Debug Docker Registry Access for QRLinkr
# Run this on Synology to identify the exact registry issue

echo "🔍 QRLinkr Docker Registry Debug"
echo "================================"
echo ""

# Check current working directory
echo "1. Current directory:"
pwd
echo ""

# Check if we're in the right place
if [ ! -f "docker-compose.synology-hostnet.yml" ]; then
    echo "❌ Not in QRLinkr directory! Please run: cd /volume1/docker/qrlinkr"
    exit 1
fi

# Check current images
echo "2. Current QRLinkr images on this system:"
docker images | grep -E "(qrlinkr|ghcr)" || echo "No QRLinkr images found"
echo ""

# Test different registry paths
echo "3. Testing registry access..."
REGISTRIES=(
    "ghcr.io/klm95441/qrlinkr/backend:latest"
    "ghcr.io/qrlinkr/backend:latest"
    "docker.io/qrlinkr/backend:latest"
    "qrlinkr/backend:latest"
)

for registry in "${REGISTRIES[@]}"; do
    echo "   Testing: $registry"
    if timeout 30 docker pull "$registry" 2>/dev/null; then
        echo "   ✅ SUCCESS: $registry"
        SUCCESS_REGISTRY="$registry"
        break
    else
        echo "   ❌ FAILED: $registry"
    fi
done

echo ""
if [ -n "$SUCCESS_REGISTRY" ]; then
    echo "4. ✅ Found working registry: $SUCCESS_REGISTRY"
    echo ""
    
    # Check the timestamp of the successful image
    echo "5. Image details:"
    docker inspect "$SUCCESS_REGISTRY" | grep -E "(Created|Id)" | head -5
    echo ""
    
    # Extract just the image name part for docker-compose
    IMAGE_NAME=$(echo "$SUCCESS_REGISTRY" | cut -d'/' -f2-)
    echo "6. Use this in your docker-compose file:"
    echo "   image: $SUCCESS_REGISTRY"
    echo ""
    
    echo "7. Quick fix - Update your docker-compose to use the working registry:"
    echo "   Edit docker-compose.synology-hostnet.yml"
    echo "   Change the backend image line to: image: $SUCCESS_REGISTRY"
    
else
    echo "4. ❌ NO WORKING REGISTRY FOUND"
    echo ""
    echo "Possible issues:"
    echo "   - GitHub Actions hasn't finished building"
    echo "   - Repository is private and needs authentication"
    echo "   - Registry path is different than expected"
    echo ""
    echo "Check GitHub Actions status at:"
    echo "   https://github.com/YOUR_USERNAME/qrlinkr/actions"
fi

echo ""
echo "8. Environment variables:"
echo "   GITHUB_REPOSITORY_OWNER: ${GITHUB_REPOSITORY_OWNER:-'(not set)'}"
echo "   USER: ${USER:-'(not set)'}"
echo ""

echo "9. Docker system info:"
docker version | head -5
