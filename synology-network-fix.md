# Synology Network Fix Guide

## Issue Diagnosis
The backend container cannot reach the database container even though both are running. This is a Docker networking issue where containers can't communicate despite being on the same network.

## Solution Steps

### Step 1: Stop All Containers
```bash
cd /volume1/docker/qrlinkr
docker-compose -f docker-compose.synology.yml down -v
```

### Step 2: Clean Docker Networks
```bash
# Remove any orphaned networks
docker network prune -f

# List existing networks to check for conflicts
docker network ls | grep qrlinkr
```

### Step 3: Check Synology Docker Network Settings
Synology might have Docker network restrictions. Try using the host network mode as a workaround:

```bash
# Use the host network configuration
cp docker-compose.synology-hostnet.yml docker-compose.synology-active.yml
cp .env.synology-hostnet .env.synology-active
```

### Step 4: Start with Host Networking
```bash
# Start with host networking (this bypasses Docker network issues)
docker-compose -f docker-compose.synology-hostnet.yml --env-file .env.synology-hostnet up -d

# Monitor logs
docker-compose -f docker-compose.synology-hostnet.yml logs -f
```

### Step 5: If Host Networking Works, Try Bridge Network Fix
If host networking works, you can try fixing the bridge network by adding explicit container names and network aliases:

**Create `docker-compose.synology-fixed.yml`:**
```yaml
services:
  db:
    image: postgres:15-alpine
    container_name: qrlinkr-db-prod-fixed
    hostname: qrlinkr-db
    restart: unless-stopped
    networks:
      qrlinkr-network:
        aliases:
          - db
          - database
          - postgres
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}']
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s

  backend:
    image: ghcr.io/${GITHUB_REPOSITORY_OWNER}/qrlinkr/backend:latest
    container_name: qrlinkr-backend-prod-fixed
    hostname: qrlinkr-backend
    restart: unless-stopped
    networks:
      qrlinkr-network:
        aliases:
          - backend
          - api
    ports:
      - '3001:3001'
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - PORT=3001
      - NODE_ENV=production
      - HOST=0.0.0.0
      - PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x
      - PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
      - PRISMA_DISABLE_WARNINGS=true
      - PGCONNECT_TIMEOUT=10
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ['CMD-SHELL', 'wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1']
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 180s

  frontend:
    image: ghcr.io/${GITHUB_REPOSITORY_OWNER}/qrlinkr/frontend:latest
    container_name: qrlinkr-frontend-prod-fixed
    hostname: qrlinkr-frontend
    restart: unless-stopped
    networks:
      qrlinkr-network:
        aliases:
          - frontend
          - web
    ports:
      - '3000:3000'
    environment:
      - NEXT_PUBLIC_API_BASE_URL=${API_BASE_URL}
      - NODE_ENV=production
      - PORT=3000
      - HOSTNAME=0.0.0.0
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ['CMD-SHELL', 'wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1']
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 90s

networks:
  qrlinkr-network:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: qrlinkr-br
      com.docker.network.driver.mtu: 1500

volumes:
  postgres_data:
```

## Debugging Commands

### Test Network Connectivity
```bash
# Test if backend can reach database
docker exec qrlinkr-backend-prod-hostnet nc -zv localhost 5433
docker exec qrlinkr-backend-prod-hostnet psql postgresql://qr:adfaFRfd2232ds@localhost:5433/qrlinkr -c "SELECT 1;"

# For bridge network version
docker exec qrlinkr-backend-prod-fixed nc -zv db 5432
docker exec qrlinkr-backend-prod-fixed nslookup db
```

### Check Network Inspection
```bash
# Inspect the Docker network
docker network inspect qrlinkr_qrlinkr-network

# Check container IPs
docker inspect qrlinkr-db-prod-fixed | grep IPAddress
docker inspect qrlinkr-backend-prod-fixed | grep IPAddress
```

## Expected Results

After implementing the host network solution, you should see:
```
✓ Database port 5433 is accessible on localhost!
✓ Database connection successful with psql!
✓ Prisma database connection successful!
✓ Database setup completed successfully.
🚀 Starting the server...
```

## Fallback Option: Manual Container Creation

If Docker Compose networking continues to fail, you can manually create containers:

```bash
# Create network
docker network create qrlinkr-manual --driver bridge

# Start database
docker run -d --name qrlinkr-db-manual \
  --network qrlinkr-manual \
  --network-alias db \
  -e POSTGRES_USER=qr \
  -e POSTGRES_PASSWORD=adfaFRfd2232ds \
  -e POSTGRES_DB=qrlinkr \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Wait for DB to start
sleep 30

# Start backend
docker run -d --name qrlinkr-backend-manual \
  --network qrlinkr-manual \
  -p 3001:3001 \
  -e DATABASE_URL=postgresql://qr:adfaFRfd2232ds@db:5432/qrlinkr \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e HOST=0.0.0.0 \
  ghcr.io/${GITHUB_REPOSITORY_OWNER}/qrlinkr/backend:latest
```

## Recommendation

**Start with the host networking approach** since it bypasses Docker networking entirely and should work reliably on Synology NAS. Once that's working, you can experiment with the bridge network fixes if you prefer container isolation.
