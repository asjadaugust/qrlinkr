#!/bin/sh

# This script ensures the database is ready and migrations are applied
# before starting the main application.

# Exit immediately if a command exits with a non-zero status.
set -e

# Set Prisma environment variables to prevent runtime binary downloads
export PRISMA_CLI_BINARY_TARGETS="debian-openssl-3.0.x"
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
export PRISMA_DISABLE_WARNINGS=true

# Run Prisma migrations
echo "Running database migrations..."
# Explicitly point to the schema location
npx prisma migrate deploy --schema=./backend/prisma/schema.prisma
echo "Migrations applied successfully."

# Start the main application (the command that was originally in the Dockerfile's CMD)
echo "Starting the server..."
exec node backend/dist/index.js
