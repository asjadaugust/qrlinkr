# QRLinkr Deployment Guide

## Development

```bash
# Clone repository
git clone https://github.com/your-username/qrlinkr.git
cd qrlinkr

# Install dependencies
npm install

# Start development servers
npm run dev
```

Access at: http://localhost:3000

## Production Deployment

### Option 1: Synology NAS (Recommended)
See [SYNOLOGY_SETUP.md](./SYNOLOGY_SETUP.md) for detailed instructions using pre-built Docker images.

### Option 2: Standard Docker Deployment

```bash
# 1. Clone and setup
git clone https://github.com/your-username/qrlinkr.git
cd qrlinkr

# 2. Create environment file
cp .env.example .env
# Edit .env with your configuration

# 3. Deploy with Docker Compose
docker-compose up -d

# 4. Run database migrations
docker-compose exec backend npm run migrate
```

## Environment Variables

### Required Variables
```bash
# Database
POSTGRES_DB=qrlinkr
POSTGRES_USER=qrlinkr
POSTGRES_PASSWORD=your-secure-password
DATABASE_URL=postgresql://qrlinkr:password@db:5432/qrlinkr

# Application
NODE_ENV=production
PORT=3001
NEXT_PUBLIC_API_BASE_URL=http://your-domain:3001
```

## Health Checks

- Backend: `GET /health`
- Frontend: `GET /` 
- Database: `pg_isready`

## Troubleshooting

1. **Check container logs**: `docker-compose logs [service]`
2. **Verify connectivity**: Test health endpoints
3. **Database issues**: Ensure migrations ran successfully
4. **Network issues**: Check firewall and port accessibility

---

For Synology-specific deployment, see [SYNOLOGY_SETUP.md](./SYNOLOGY_SETUP.md).

