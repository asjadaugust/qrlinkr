# QRLinkr Synology NAS Setup Guide

This guide shows how to deploy QRLinkr on Synology NAS using pre-built images from GitHub Container Registry (GHCR).

## Why Use GHCR Images?

✅ **Fast Deployment**: No building required on your NAS  
✅ **Consistent Images**: Same images across all environments  
✅ **Automatic Updates**: GitHub Actions builds and pushes latest images  
✅ **Resource Efficient**: No compilation load on your NAS  

## Prerequisites

- **Synology NAS** with DSM 7.0 or later
- **Container Manager** package installed
- **Admin access** to your NAS

## Quick Setup

### 1. Prepare Files
1. Create folder: `/docker/qrlinkr/` on your NAS
2. Copy `docker-compose.synology.yml` → rename to `docker-compose.yml`
3. Copy `.env.synology` → rename to `.env`
4. Update your NAS IP in `.env` file

### 2. Deploy in Container Manager
1. Open **Container Manager**
2. Go to **Project** → **Create**
3. Choose **Create docker-compose.yml**
4. Select your `/docker/qrlinkr/` folder
5. Click **Create**

### 3. Access Your Application
- **Frontend**: `http://your-nas-ip:3000`
- **Backend API**: `http://your-nas-ip:3001`
- **Health Check**: `http://your-nas-ip:3001/health`

## Configuration

### Environment Variables (.env)
```bash
# Database Configuration
POSTGRES_DB=qrlinkr
POSTGRES_USER=qrlinkr
POSTGRES_PASSWORD=your-secure-password

# Application URLs
DATABASE_URL=postgresql://qrlinkr:your-secure-password@db:5432/qrlinkr
API_BASE_URL=http://your-nas-ip:3001
```

### Docker Images Used
- **Backend**: `ghcr.io/asjadaugust/qrlinker-backend:latest`
- **Frontend**: `ghcr.io/asjadaugust/qrlinker-frontend:latest`
- **Database**: `postgres:15-alpine`

## Troubleshooting

### Backend Cannot Connect to Database
**Solution**: Ensure database service is named `db` in docker-compose.yml ✅

### Frontend Cannot Connect to Backend
**Solution**: Update `API_BASE_URL` in `.env` with your actual NAS IP

### Container Health Check Failures
**Solution**: Check if health endpoints respond:
- Backend: `curl http://your-nas-ip:3001/health`
- Frontend: `curl http://your-nas-ip:3000`

## Updating QRLinkr

### Automatic Updates (Recommended)

Your GitHub Actions workflow automatically:
1. **Builds** new images on code changes
2. **Pushes** to GHCR with `latest` tag
3. **Tags** with version numbers

### Manual Update Process

1. **In Container Manager**:
   - Go to **Project** → **qrlinkr**
   - Click **Action** → **Reset**
   - This pulls latest images and restarts

2. **Via SSH** (Advanced):
   ```bash
   cd /volume1/docker/qrlinkr
   docker-compose pull
   docker-compose up -d
   ```

## Advanced Configuration

### Custom Domain with Reverse Proxy

1. **Control Panel** → **Application Portal** → **Reverse Proxy**
2. **Create rules**:
   ```
   Source: qr.yourdomain.com → Destination: localhost:3000
   Source: qr.yourdomain.com/api → Destination: localhost:3001
   ```

### SSL/HTTPS Setup

1. **Upload SSL certificate** in Control Panel → Security → Certificate
2. **Configure reverse proxy** to use HTTPS
3. **Update environment**:
   ```bash
   API_BASE_URL=https://qr.yourdomain.com/api
   ```

## Data Backup

### Database Backup
```bash
# SSH into NAS and run:
docker exec qrlinkr-postgres pg_dump -U qrlinkr qrlinkr > backup.sql
```

### Full Project Backup
1. **Container Manager** → **Project** → **qrlinkr** → **Action** → **Export**
2. **Save the exported file** for restore capability

## Monitoring

### View Logs
```bash
# Real-time logs
docker-compose logs -f

# Specific service logs  
docker-compose logs backend
docker-compose logs frontend
```

### Performance Monitoring
Monitor resource usage in **Container Manager** → **Container** → **Details** → **Terminal & Logs**.

## Support

If you encounter issues:
1. Check container logs in Container Manager
2. Verify network connectivity between services
3. Ensure all environment variables are correct

---

*QRLinkr - The persistent link behind your printed QR codes.*
