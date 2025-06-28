#!/bin/sh

# This script ensures the database is ready and migrations are applied
# before starting the main application.

# Exit immediately if a command exits with a non-zero status.
set -e

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy
echo "Migrations applied successfully."

# Start the main application (the command that was originally in the Dockerfile's CMD)
exec "$@"
