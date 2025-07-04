# QRLinkr Synology Database Connection Troubleshooting

## Quick Debugging Steps

### 1. Check if all containers are running
```bash
docker-compose -f docker-compose.synology.yml ps
```

### 2. Check database container logs
```bash
docker-compose -f docker-compose.synology.yml logs db
```

### 3. Check database health status
```bash
docker inspect qrlinkr-db-prod --format='{{.State.Health.Status}}'
```

### 4. Test database connection from host
```bash
# Test if database port is accessible from host
nc -zv 192.168.178.13 5432

# Test actual database connection
PGPASSWORD=adfaFRfd2232ds psql -h 192.168.178.13 -U qr -d qrlinkr -c "SELECT 1;"
```

### 5. Test database connection from backend container
```bash
# Get into the backend container
docker exec -it qrlinkr-backend-prod sh

# Test network connectivity
nc -zv db 5432

# Test actual database connection
PGPASSWORD=adfaFRfd2232ds psql -h db -U qr -d qrlinkr -c "SELECT 1;"
```

### 6. Check Docker network
```bash
# List Docker networks
docker network ls

# Inspect the QRLinkr network
docker network inspect qrlinkr_qrlinkr-network
```

## Common Issues and Solutions

### Issue 1: Database container not healthy
**Symptoms**: Database container shows as unhealthy
**Solution**: Check database logs for startup errors

### Issue 2: Network connectivity issues
**Symptoms**: Backend can't reach database container
**Solution**: Verify both containers are on the same network

### Issue 3: Database credentials mismatch
**Symptoms**: Connection refused or authentication failed
**Solution**: Verify .env.synology credentials match

### Issue 4: Database not fully initialized
**Symptoms**: Port accessible but queries fail
**Solution**: Wait longer for database initialization

## Updated Configuration

The entrypoint script has been updated with:
- Better database connection parsing
- More reliable connectivity testing using netcat and psql
- Enhanced debugging output
- Fallback connection methods

## Next Steps

1. Rebuild and push the updated backend image
2. Pull the new image on Synology
3. Restart the containers
4. Monitor the logs for improved debugging information
