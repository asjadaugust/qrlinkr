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
# The backend URL will be provided at runtime
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the Next.js application, specifying the workspace
RUN npm run build --workspace=frontend

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

# Change ownership of the entire app directory
RUN chown -R frontend-user:frontend-group /app

# Set the working directory to the frontend app
WORKDIR /app/frontend

# Switch to the non-root user
USER frontend-user

# Expose the port the app runs on
EXPOSE 3000

# The default command for the standalone output is to run the server.js file
CMD ["node", "server.js"]
