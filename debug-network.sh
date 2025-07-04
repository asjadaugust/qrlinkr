#!/bin/bash

# QRLinkr Network Debugging Script for Synology NAS
# Run this script to diagnose Docker networking issues

set -e

echo "=== QRLinkr Network Debugging ==="
echo "Timestamp: $(date)"
echo

# Check if Docker Compose is running
echo "1. Checking Docker Compose status..."
if docker compose -f docker-compose.synology.yml ps; then
    echo "✓ Docker Compose services are running"
else
    echo "❌ Docker Compose services are not running"
    exit 1
fi
echo

# Check if containers can communicate
echo "2. Testing inter-container networking..."

# Test database connectivity from backend container
echo "Testing database connection from backend container..."
if docker compose -f docker-compose.synology.yml exec backend sh -c "nc -z db 5432"; then
    echo "✓ Backend can reach database on port 5432"
else
    echo "❌ Backend cannot reach database on port 5432"
fi

# Test DNS resolution
echo "Testing DNS resolution from backend container..."
if docker compose -f docker-compose.synology.yml exec backend sh -c "nslookup db"; then
    echo "✓ Backend can resolve 'db' hostname"
else
    echo "❌ Backend cannot resolve 'db' hostname"
fi

# Test psql connection
echo "Testing PostgreSQL connection from backend container..."
if docker compose -f docker-compose.synology.yml exec backend sh -c "psql postgresql://qr:adfaFRfd2232ds@db:5432/qrlinkr -c 'SELECT 1;'"; then
    echo "✓ Backend can connect to PostgreSQL"
else
    echo "❌ Backend cannot connect to PostgreSQL"
fi
echo

# Check network configuration
echo "3. Checking Docker network configuration..."
docker network ls | grep qrlinkr || echo "❌ QRLinkr network not found"

if docker network inspect qrlinkr_qrlinkr-network >/dev/null 2>&1; then
    echo "✓ QRLinkr network exists"
    echo "Network details:"
    docker network inspect qrlinkr_qrlinkr-network | jq '.[] | {Name: .Name, Driver: .Driver, Containers: .Containers}'
else
    echo "❌ QRLinkr network not found"
fi
echo

# Check logs for errors
echo "4. Checking recent logs for errors..."
echo "Database logs (last 20 lines):"
docker compose -f docker-compose.synology.yml logs --tail=20 db

echo
echo "Backend logs (last 20 lines):"
docker compose -f docker-compose.synology.yml logs --tail=20 backend

echo
echo "=== Debugging Complete ==="
echo "If issues persist, check the logs above for specific error messages."
