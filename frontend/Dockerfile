# Dockerfile for Next.js Frontend

# 1. Builder Stage: Install dependencies and build the application
FROM node:20.15.1-slim AS builder

# Update base image packages to patch known OS-level vulnerabilities
RUN apt-get update && apt-get upgrade -y --no-install-recommends

WORKDIR /app

# Copy all necessary package and lock files from the monorepo root
COPY package*.json ./
COPY frontend/package.json ./frontend/
COPY shared/types/package.json ./shared/types/

# Install all monorepo dependencies
RUN npm install --workspaces --frozen-lockfile --ignore-scripts

# Copy the frontend's source code and the shared types
COPY frontend/ ./frontend/
COPY shared/ ./shared/

# Set build-time environment variables
# The backend URL will be provided at runtime or build time
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_BACKEND_HOST
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_BACKEND_HOST=${NEXT_PUBLIC_BACKEND_HOST}

# Build the Next.js application, specifying the workspace
RUN cd frontend && npm run build

# 2. Production Stage: Create the final, lean image
FROM node:20.15.1-slim

# Update base image packages to patch known OS-level vulnerabilities
RUN apt-get update && apt-get upgrade -y --no-install-recommends

WORKDIR /app

# Create a non-root user for better security
RUN addgroup --system --gid 1001 frontend-group && adduser --system --uid 1001 frontend-user

# Copy production dependency manifests
COPY package*.json ./
COPY frontend/package.json ./frontend/
COPY shared/types/package.json ./shared/types/

# Install only production dependencies for all workspaces
# Next.js needs some devDependencies (like typescript) to run `npm start`
# so we install all dependencies for the frontend workspace.
RUN npm install --workspaces --frozen-lockfile --ignore-scripts

# Copy only necessary production assets from the builder stage
COPY --from=builder --chown=frontend-user:frontend-group /app/frontend/.next/standalone ./
COPY --from=builder --chown=frontend-user:frontend-group /app/frontend/public ./public
COPY --from=builder --chown=frontend-user:frontend-group /app/frontend/.next/static ./.next/static

# Copy entrypoint script
COPY --chown=frontend-user:frontend-group frontend/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Change ownership of the entire app directory
RUN chown -R frontend-user:frontend-group /app

# The working directory should be /app where server.js is located
WORKDIR /app

# Switch to the non-root user
USER frontend-user

# Expose the port the app runs on
EXPOSE 3000

# Use entrypoint script to inject runtime configuration
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]
