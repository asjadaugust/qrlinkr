# Dockerfile for Backend (Fastify + Prisma)

# 1. Builder Stage: Install dependencies and build the application
FROM node:20.15.1-slim AS builder

# Update base image packages and install OpenSSL to avoid Prisma warnings
RUN apt-get update && apt-get upgrade -y --no-install-recommends && apt-get install -y openssl

WORKDIR /app

# Copy all necessary package and lock files from the monorepo root
# This is optimized to leverage Docker layer caching.
COPY package*.json ./
COPY backend/package.json ./backend/
COPY shared/types/package.json ./shared/types/

# Install all monorepo dependencies
RUN npm install --workspaces --frozen-lockfile --ignore-scripts

# Copy the backend's source code, tsconfig, and Prisma schema
COPY backend/src ./backend/src
COPY backend/prisma ./backend/prisma
COPY backend/tsconfig.json ./backend/tsconfig.json

# Generate Prisma Client, specifying the correct schema path
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# Build the backend application, specifying the workspace
RUN npm run build --workspace=backend

# 2. Production Stage: Create the final, lean image
FROM node:20.15.1-slim

# Update base image packages and install OpenSSL for Prisma runtime
RUN apt-get update && apt-get upgrade -y --no-install-recommends && apt-get install -y openssl

WORKDIR /app

# Create a non-root user for better security
RUN addgroup --system --gid 1002 backend-group && adduser --system --uid 1002 backend-user

# Copy production dependencies manifests
COPY package*.json ./
COPY backend/package.json ./backend/
COPY shared/types/package.json ./shared/types/

# Install only production dependencies for all workspaces
RUN npm install --workspaces --frozen-lockfile --production --ignore-scripts

# Selectively copy only the necessary production artifacts from the builder stage
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client

# Copy the entrypoint script
COPY backend/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Change ownership of the app directory to the non-root user
RUN chown -R backend-user:backend-group /app

# Switch to the non-root user
USER backend-user

# Expose the port the app runs on
EXPOSE 3001

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# The command to start the application
# This will be passed to the entrypoint script
CMD ["node", "backend/dist/index.js"]
