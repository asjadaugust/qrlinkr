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

**Problem:** Frontend can't connect to backend
**Solution:** Verify `API_BASE_URL` uses the correct server IP/domain that browsers can access

**Problem:** Database connection errors
**Solution:** Check `DATABASE_URL` and ensure PostgreSQL container is running

**Problem:** CORS errors
**Solution:** Update backend CORS configuration to allow your domain
