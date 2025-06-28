# Dockerfile for Next.js Frontend

# 1. Builder Stage: Build the Next.js application
# Use a specific, recent version of the Node.js LTS image for better security and reproducibility
FROM node:20.15.1-slim AS builder

# Update base image packages to patch known OS-level vulnerabilities
RUN apt-get update && apt-get upgrade -y --no-install-recommends

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Set build-time environment variables
# The backend URL will be provided at runtime
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the Next.js application
RUN npm run build

# 2. Runner Stage: Create the final, lean image
FROM node:20.15.1-slim

# Update base image packages to patch known OS-level vulnerabilities
RUN apt-get update && apt-get upgrade -y --no-install-recommends

WORKDIR /app

# Create a non-root user for better security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Switch to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# The command to start the application in production mode
CMD ["npm", "start"]
