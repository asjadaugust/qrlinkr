#!/bin/bash

# QRLinkr Synology Setup Script - Uses GHCR Pre-built Images
# This script prepares your project for Synology NAS deployment using
# pre-built images from GitHub Container Registry (GHCR)

echo "🚀 QRLinkr Synology Setup Script (GHCR Images)"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the QRLinkr project root directory"
    exit 1
fi

echo "📦 Setting up Synology deployment with GHCR images..."

# Copy the Synology docker-compose file
if [ -f "docker-compose.synology.yml" ]; then
    cp docker-compose.synology.yml docker-compose.yml
    echo "✅ Created docker-compose.yml for Synology (using GHCR images)"
else
    echo "❌ Error: docker-compose.synology.yml not found"
    exit 1
fi

# Create .env file from template
if [ -f ".env.synology" ]; then
    if [ ! -f ".env" ]; then
        cp .env.synology .env
        echo "✅ Created .env file from template"
        echo "⚠️  IMPORTANT: Update your NAS IP address in .env file!"
    else
        echo "ℹ️  .env file already exists, skipping..."
        echo "💡 You may want to compare it with .env.synology for new settings"
    fi
else
    echo "❌ Error: .env.synology template not found"
    exit 1
fi

echo ""
echo "🎯 Deployment advantages with GHCR images:"
echo "✅ Fast deployment (no building on NAS)"
echo "✅ Consistent across environments"
echo "✅ Automatic updates via GitHub Actions"
echo "✅ Resource efficient (no compilation load)"
echo ""
echo "🔄 To update QRLinkr later:"
echo "1. Your GitHub Actions will push new images to GHCR"
echo "2. In Synology Container Manager: Project → qrlinkr → Action → Reset"
echo "3. Or run: docker-compose pull && docker-compose up -d"
echo ""
echo "📋 Next steps for Synology NAS deployment:"
echo "1. Edit .env file and replace 'your-nas-ip' with your actual NAS IP"
echo "2. Upload this folder to your NAS (e.g., /docker/qrlinkr/)"
echo "3. Open Container Manager on your NAS"
echo "4. Go to Project → Create → Choose the uploaded folder"
echo "5. Wait for image download and deployment (2-3 minutes)"
echo "6. Access QRLinkr at http://your-nas-ip:3000"
echo ""
echo "📖 For detailed instructions, see the upcoming SYNOLOGY_SETUP.md"
echo ""
echo "✨ Setup complete! Ready for Synology deployment with GHCR images."
