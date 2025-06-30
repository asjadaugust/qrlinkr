#!/bin/bash

echo "Testing QRLinkr API endpoints..."

# Test backend health
echo "1. Testing backend health endpoint..."
curl -v http://localhost:3001/ || echo "Backend not accessible"

# Test CORS preflight
echo -e "\n2. Testing CORS preflight..."
curl -v -X OPTIONS -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: DELETE" -H "Access-Control-Request-Headers: Content-Type" http://localhost:3001/api/qr/test

# Test creating a QR link
echo -e "\n3. Testing QR link creation..."
CREATE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"destination": "https://example.com", "custom_slug": "test123"}' http://localhost:3001/api/qr/new)
echo "Create response: $CREATE_RESPONSE"

# Extract ID from response for deletion test
LINK_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Extracted link ID: $LINK_ID"

if [ ! -z "$LINK_ID" ]; then
    echo -e "\n4. Testing QR link deletion..."
    curl -v -X DELETE -H "Content-Type: application/json" http://localhost:3001/api/qr/$LINK_ID
fi

echo -e "\nTest completed."
