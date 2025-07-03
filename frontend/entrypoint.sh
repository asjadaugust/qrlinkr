#!/bin/sh

# Startup script for QRLinkr Frontend
# This script injects runtime environment variables into the config file

echo "=== QRLinkr Frontend Startup ==="
echo "NEXT_PUBLIC_API_BASE_URL: $NEXT_PUBLIC_API_BASE_URL"

# Generate runtime configuration
CONFIG_FILE="/app/public/config.js"
if [ -f "$CONFIG_FILE" ]; then
    # Determine the appropriate API base URL based on environment
    if [ -z "$NEXT_PUBLIC_API_BASE_URL" ] || [ "$NEXT_PUBLIC_API_BASE_URL" = "" ]; then
        echo "No API base URL set, using default..."
        API_BASE_URL="http://localhost:3001"
    else
        # Check if the API base URL is using Docker service name
        if echo "$NEXT_PUBLIC_API_BASE_URL" | grep -q "backend:3001"; then
            # For local Docker development, browser needs to use host-mapped port
            API_BASE_URL="http://localhost:3001"
            echo "Converting Docker service URL to host-mapped URL: $API_BASE_URL"
        else
            API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL"
            echo "Using provided API base URL: $API_BASE_URL"
        fi
    fi
    
    echo "Injecting API base URL into config: $API_BASE_URL"
    sed -i "s|__API_BASE_URL_PLACEHOLDER__|$API_BASE_URL|g" "$CONFIG_FILE"
    
    echo "Generated config file:"
    cat "$CONFIG_FILE"
else
    echo "Config file not found at $CONFIG_FILE"
fi

echo "Starting Next.js application..."
exec "$@"
