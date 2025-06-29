# QRLinkr Production Deployment Guide

## Deployment on Server/Synology NAS

### 1. Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)
- Access to the server/NAS terminal

### 2. Deployment Steps

#### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/qrlinkr.git
cd qrlinkr
```

#### Step 2: Create Production Environment File
```bash
cp .env.production.example .env.production
```

#### Step 3: Configure Environment Variables
Edit `.env.production` and update:

**For Synology NAS:**
```env
# Replace 192.168.1.100 with your NAS IP address
API_BASE_URL=http://192.168.1.100:3001
DATABASE_URL=postgresql://qrlinkr_user:your_secure_password@db:5432/qrlinkr
POSTGRES_USER=qrlinkr_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=qrlinkr
```

**For Server with Domain:**
```env
API_BASE_URL=https://api.yourdomain.com
DATABASE_URL=postgresql://qrlinkr_user:your_secure_password@db:5432/qrlinkr
POSTGRES_USER=qrlinkr_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=qrlinkr
```

#### Step 4: Update Docker Compose Images
Edit `docker-compose.prod.yml` and replace `qrlinkr-owner` with your GitHub username:
```yaml
image: ghcr.io/YOUR_GITHUB_USERNAME/qrlinkr-backend:latest
image: ghcr.io/YOUR_GITHUB_USERNAME/qrlinkr-frontend:latest
```

#### Step 5: Deploy
```bash
# Pull the latest images
docker compose -f docker-compose.prod.yml pull

# Start the services
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### 3. Access Your Application

**Frontend:** `http://YOUR_SERVER_IP:3000`
**API:** `http://YOUR_SERVER_IP:3001/api`

### 4. Network Configuration Examples

#### Local Network (Synology NAS)
If your NAS IP is `192.168.1.100`:
- Frontend: `http://192.168.1.100:3000`
- API calls will go to: `http://192.168.1.100:3001`

#### Public Domain
If you have a domain `myqr.example.com`:
- Setup DNS A record pointing to your server
- Configure reverse proxy (nginx/traefik) for SSL
- Use: `https://myqr.example.com` and `https://api.myqr.example.com`

### 5. Firewall Configuration
Ensure these ports are open:
- `3000` - Frontend
- `3001` - Backend API
- `5432` - PostgreSQL (only if external access needed)

### 6. SSL/HTTPS (Recommended for Production)
For HTTPS, you'll need:
1. A reverse proxy (nginx, traefik, or Cloudflare)
2. SSL certificates (Let's Encrypt recommended)
3. Update `API_BASE_URL` to use `https://`

### 7. Monitoring
Check logs:
```bash
docker compose -f docker-compose.prod.yml logs -f
```

Check container status:
```bash
docker compose -f docker-compose.prod.yml ps
```

### 8. Backup
Regular backup of PostgreSQL data:
```bash
docker compose -f docker-compose.prod.yml exec db pg_dump -U qrlinkr_user qrlinkr > backup.sql
```

### Troubleshooting

#### Common Issues and Solutions

**1. Frontend shows network/connection errors (ECONNREFUSED, ERR_NAME_NOT_RESOLVED)**
- **Cause:** `API_BASE_URL` is set incorrectly
- **Solution:** 
  ```bash
  # Check your server's IP address
  ip addr show | grep inet
  # or
  hostname -I
  
  # Update .env.production with the correct IP
  API_BASE_URL=http://YOUR_ACTUAL_IP:3001
  
  # Rebuild and restart
  docker compose -f docker-compose.prod.yml down
  docker compose -f docker-compose.prod.yml --env-file .env.production up -d
  ```

**2. Frontend logs show "Failed to proxy http://localhost:3001/api/..."**
- **Cause:** Frontend is still using Next.js rewrites instead of direct API calls
- **Solution:** 
  ```bash
  # Verify API_BASE_URL is set correctly
  docker compose -f docker-compose.prod.yml exec frontend env | grep NEXT_PUBLIC
  
  # Should show: NEXT_PUBLIC_API_BASE_URL=http://YOUR_IP:3001
  # Should NOT show: NEXT_PUBLIC_BACKEND_HOST
  
  # If not correct, update .env.production and rebuild frontend image
  ```

**3. Backend API returns 500/404 errors**
- **Cause:** Database connection issues or backend startup problems
- **Solution:**
  ```bash
  # Check backend logs
  docker compose -f docker-compose.prod.yml logs backend
  
  # Check if database is accessible
  docker compose -f docker-compose.prod.yml exec backend npm run db:status
  
  # Run database migrations if needed
  docker compose -f docker-compose.prod.yml exec backend npm run db:migrate
  ```

**4. Database connection errors**
- **Cause:** Incorrect `DATABASE_URL` or PostgreSQL not ready
- **Solution:** 
  ```bash
  # Check PostgreSQL container
  docker compose -f docker-compose.prod.yml logs db
  
  # Verify DATABASE_URL format
  DATABASE_URL=postgresql://username:password@db:5432/database_name
  ```

**5. Images not found or outdated**
- **Cause:** Docker images not built or pushed to registry
- **Solution:**
  ```bash
  # Pull latest images
  docker compose -f docker-compose.prod.yml pull
  
  # If images don't exist, build locally
  docker build -t qrlinkr-frontend:local ./frontend
  docker build -t qrlinkr-backend:local ./backend
  
  # Update docker-compose.prod.yml to use local images temporarily
  ```

#### Debug Commands

```bash
# Check all container statuses
docker compose -f docker-compose.prod.yml ps

# View all logs
docker compose -f docker-compose.prod.yml logs

# View logs for specific service
docker compose -f docker-compose.prod.yml logs frontend
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs db

# Check environment variables
docker compose -f docker-compose.prod.yml exec frontend env
docker compose -f docker-compose.prod.yml exec backend env

# Test API directly
curl http://YOUR_IP:3001/api/health

# Test database connection
docker compose -f docker-compose.prod.yml exec db psql -U qrlinkr_user -d qrlinkr -c "SELECT 1;"
```

#### Verification Steps

1. **Backend Health Check:**
   ```bash
   curl http://YOUR_IP:3001/api/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

2. **Frontend Environment Check:**
   ```bash
   docker compose -f docker-compose.prod.yml exec frontend env | grep NEXT_PUBLIC
   # Should show: NEXT_PUBLIC_API_BASE_URL=http://YOUR_IP:3001
   ```

3. **Network Connectivity:**
   ```bash
   # From your local machine, test if you can reach the API
   curl http://YOUR_IP:3001/api/qr/links
   # Should return empty array [] or list of links
   ```

4. **Browser Developer Tools:**
   - Open browser dev tools (F12)
   - Go to Network tab
   - Try creating a QR code
   - Check if requests go to `http://YOUR_IP:3001/api/...` (correct)
   - NOT to `/api/...` or `http://localhost:3001/api/...` (incorrect)

#### Emergency Reset

If all else fails:
```bash
# Stop all containers
docker compose -f docker-compose.prod.yml down

# Remove all containers and volumes (WARNING: This deletes data)
docker compose -f docker-compose.prod.yml down -v

# Clean up Docker system
docker system prune -a

# Rebuild and restart
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```
