#!/bin/sh

# Startup script for QRLinkr Frontend
# This script injects runtime environment variables into the config file

echo "=== QRLinkr Frontend Startup ==="
echo "NEXT_PUBLIC_API_BASE_URL: $NEXT_PUBLIC_API_BASE_URL"

# Generate runtime configuration
CONFIG_FILE="/app/public/config.js"
if [ -f "$CONFIG_FILE" ]; then
    # If NEXT_PUBLIC_API_BASE_URL is not set or is empty, use host-mapped backend port
    if [ -z "$NEXT_PUBLIC_API_BASE_URL" ] || [ "$NEXT_PUBLIC_API_BASE_URL" = "" ]; then
        echo "No API base URL set, using host-mapped backend port..."
        
        # For browser access, use localhost with the mapped port from docker-compose
        # The backend container is mapped to host port 3001
        API_BASE_URL="http://localhost:3001"
        echo "Using host-mapped backend port: $API_BASE_URL"
    else
        API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL"
        echo "Using provided API base URL: $API_BASE_URL"
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
