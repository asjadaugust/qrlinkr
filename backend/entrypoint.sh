#!/bin/sh

# This script ensures the database is ready and migrations are applied
# before starting the main application.

# Exit immediately if a command exits with a non-zero status.
set -e

echo "=== QRLinkr Backend Startup ==="
echo "NODE_ENV: $NODE_ENV"
echo "DATABASE_URL: $DATABASE_URL"
echo "Current working directory: $(pwd)"
echo "Contents: $(ls -la)"

# Parse DATABASE_URL to extract connection details
if [ -n "$DATABASE_URL" ]; then
    # Extract components from postgresql://user:password@host:port/database
    DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
    DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
    DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
    
    echo "Parsed DB connection details:"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"  
    echo "  User: $DB_USER"
    echo "  Database: $DB_NAME"
    echo "  Password: [hidden]"
    
    # Set environment variables for psql
    export PGPASSWORD="$DB_PASSWORD"
    export PGUSER="$DB_USER"
    export PGHOST="$DB_HOST"
    export PGPORT="$DB_PORT"
    export PGDATABASE="$DB_NAME"
fi

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
    
    # First, test basic port connectivity with netcat
    if command -v nc >/dev/null 2>&1; then
        if nc -z "$DB_HOST" "$DB_PORT"; then
            echo "Database port $DB_PORT is accessible on $DB_HOST!"
            
            # Now test actual database connection with psql
            if psql -c "SELECT 1;" >/dev/null 2>&1; then
                echo "Database connection successful with psql!"
                break
            else
                echo "Port accessible but database not ready yet..."
            fi
        else
            echo "Cannot reach database port $DB_PORT on $DB_HOST"
        fi
    else
        # Fallback to direct psql test if nc is not available
        echo "Testing database connection directly with psql..."
        if psql -c "SELECT 1;" >/dev/null 2>&1; then
            echo "Database connection successful!"
            break
        else
            echo "Database connection failed"
        fi
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "Failed to connect to database after $max_attempts attempts"
        echo "=== DEBUGGING INFORMATION ==="
        echo "DATABASE_URL: $DATABASE_URL"
        echo "DB_HOST: $DB_HOST"
        echo "DB_PORT: $DB_PORT"
        echo "DB_USER: $DB_USER"
        echo "DB_NAME: $DB_NAME"
        echo "DB_PASSWORD: [hidden]"
        echo "Trying to ping database container..."
        if command -v ping >/dev/null 2>&1; then
            ping -c 3 "$DB_HOST" || echo "Ping to $DB_HOST failed"
        fi
        echo "Checking if port $DB_PORT is listening on $DB_HOST..."
        if command -v nc >/dev/null 2>&1; then
            nc -v -z "$DB_HOST" "$DB_PORT" || echo "Port check failed"
        fi
        echo "Attempting direct psql connection with verbose output..."
        psql -c "SELECT 1;" || echo "Direct psql connection failed"
        exit 1
    fi
    
    echo "Database not ready, waiting 2 seconds..."
    sleep 2
    attempt=$((attempt + 1))
done

# Additional database readiness check using Prisma
echo "Testing database connection with Prisma..."
if npx prisma db execute --sql "SELECT 1" --schema=./backend/prisma/schema.prisma; then
    echo "Prisma database connection successful!"
else
    echo "Prisma database connection failed, but continuing..."
    echo "This might be expected if migrations haven't been run yet."
fi

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy --schema=./backend/prisma/schema.prisma || {
    echo "Migration failed, trying to push schema instead..."
    npx prisma db push --schema=./backend/prisma/schema.prisma
}
echo "Database setup completed successfully."

# Start the main application
echo "Starting the server..."
exec node backend/dist/index.js
