#!/bin/bash

# Quick Docker Image Content Verification
# Check if the pulled image has the correct package.json content

echo "🔍 Docker Image Content Verification"
echo "===================================="

BACKEND_IMAGE="ghcr.io/asjadaugust/qrlinkr/backend:latest"

echo "1. Pulling latest image..."
docker pull "$BACKEND_IMAGE"

echo ""
echo "2. Checking package.json content in the image..."
echo "   Looking for 'type': 'module' in package.json..."

# Run a temporary container to check package.json content
PACKAGE_CONTENT=$(docker run --rm "$BACKEND_IMAGE" cat /app/package.json 2>/dev/null || echo "Failed to read package.json")

if [[ "$PACKAGE_CONTENT" == *'"type": "module"'* ]]; then
    echo "   ✅ SUCCESS: Image contains 'type': 'module'"
    echo "   🎉 The Docker image has the ES module fix!"
else
    echo "   ❌ FAILED: Image does NOT contain 'type': 'module'"
    echo "   📄 Image package.json content:"
    echo "$PACKAGE_CONTENT" | head -10
    echo ""
    echo "   🚨 This means GitHub Actions didn't build properly or we're getting a cached image"
fi

echo ""
echo "3. Image creation timestamp:"
docker inspect "$BACKEND_IMAGE" | grep '"Created"' | head -1

echo ""
echo "4. Image layers (to verify it's a new build):"
docker history "$BACKEND_IMAGE" | head -5
