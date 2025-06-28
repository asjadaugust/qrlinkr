# Dockerfile for Backend (Fastify + Prisma)

# 1. Builder Stage: Install dependencies and build the application
FROM node:20.15.1-slim AS builder

# Update base image packages to patch known OS-level vulnerabilities
RUN apt-get update && apt-get upgrade -y --no-install-recommends

WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
# This ensures the client is generated based on the schema before building
RUN npx prisma generate

# Copy the rest of the application source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# 2. Production Stage: Create the final, lean image
FROM node:20.15.1-slim

# Update base image packages to patch known OS-level vulnerabilities
RUN apt-get update && apt-get upgrade -y --no-install-recommends

WORKDIR /app

# Create a non-root user for better security
RUN addgroup --system --gid 1002 backend-group
RUN adduser --system --uid 1002 backend-user

# Copy built application and necessary files from the builder stage
COPY --from=builder --chown=backend-user:backend-group /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder --chown=backend-user:backend-group /app/prisma ./prisma

# Switch to the non-root user
USER backend-user

# Expose the port the app runs on
EXPOSE 3001

# The command to start the application
# It first runs any pending migrations and then starts the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
