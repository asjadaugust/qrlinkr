#!/bin/sh

# This script ensures the database is ready and migrations are applied
# before starting the main application.

# Exit immediately if a command exits with a non-zero status.
set -e

# Set Prisma environment variables to prevent runtime binary downloads
export PRISMA_CLI_BINARY_TARGETS="debian-openssl-3.0.x"
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
export PRISMA_DISABLE_WARNINGS=true

# Wait for database to be ready with retry logic
echo "Waiting for database to be ready..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "Attempt $attempt/$max_attempts: Testing database connection..."
    
    # Test basic database connectivity by checking if port is accessible
    if timeout 5 sh -c "cat < /dev/null > /dev/tcp/db/5432" 2>/dev/null; then
        echo "Database port is accessible!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "Failed to connect to database after $max_attempts attempts"
        echo "Checking DATABASE_URL format..."
        echo "DATABASE_URL: $DATABASE_URL"
        exit 1
    fi
    
    echo "Database not ready, waiting 2 seconds..."
    sleep 2
    attempt=$((attempt + 1))
done

# Run Prisma migrations
echo "Running database migrations..."
# Explicitly point to the schema location
npx prisma migrate deploy --schema=./backend/prisma/schema.prisma
echo "Migrations applied successfully."

# Start the main application (the command that was originally in the Dockerfile's CMD)
echo "Starting the server..."
exec node backend/dist/index.js
