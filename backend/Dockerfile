# Dockerfile for Backend (Fastify + Prisma)

# 1. Builder Stage: Install dependencies and build the application
FROM node:20.15.1-slim AS builder

# Update base image packages to patch known OS-level vulnerabilities
RUN apt-get update && apt-get upgrade -y --no-install-recommends

WORKDIR /app

# Copy all necessary package and lock files from the monorepo root
# This is optimized to leverage Docker layer caching.
COPY package*.json ./
COPY backend/package.json ./backend/
COPY shared/types/package.json ./shared/types/

# Install all monorepo dependencies
RUN npm install --workspaces --frozen-lockfile

# Copy the backend's source code and Prisma schema
COPY backend/src ./backend/src
COPY backend/prisma ./backend/prisma

# Generate Prisma Client, specifying the correct schema path
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# Build the backend application, specifying the workspace
RUN npm run build --workspace=backend

# 2. Production Stage: Create the final, lean image
FROM node:20.15.1-slim

# Update base image packages to patch known OS-level vulnerabilities
RUN apt-get update && apt-get upgrade -y --no-install-recommends

WORKDIR /app

# Create a non-root user for better security
RUN addgroup --system --gid 1002 backend-group
RUN adduser --system --uid 1002 backend-user

# Selectively copy only the necessary production artifacts from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/backend/prisma ./prisma

# Copy the entrypoint script, ensuring the path is relative to the context
COPY --chown=backend-user:backend-group backend/entrypoint.sh /app/entrypoint.sh

# Switch to the non-root user
USER backend-user

# Expose the port the app runs on
EXPOSE 3001

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# The command to start the application
# This will be passed to the entrypoint script
CMD ["node", "dist/index.js"]
