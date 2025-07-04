# 🔧 QRLinkr Container Update Troubleshooting

## Current Issue: Old Container Image
Your Synology is running an **outdated Docker image** built before our ES module fixes. The logs show:
```
SyntaxError: Cannot use import statement outside a module
```

This confirms the container doesn't have our `"type": "module"` fix in `package.json`.

## 🚀 Quick Fix Instructions

### Step 1: Check GitHub Actions Build
1. Go to your GitHub repository → **Actions** tab
2. Look for the latest workflow run after commit `16c4755`
3. **Wait for it to complete successfully** ✅

### Step 2: Update Synology with New Images
Run this on your Synology NAS:

```bash
# Navigate to project directory
cd /volume1/docker/qrlinkr

# Stop containers and pull new images
docker-compose -f docker-compose.synology-hostnet.yml down
docker pull ghcr.io/$GITHUB_REPOSITORY_OWNER/qrlinkr/backend:latest
docker pull ghcr.io/$GITHUB_REPOSITORY_OWNER/qrlinkr/frontend:latest

# Start with new images
docker-compose -f docker-compose.synology-hostnet.yml --env-file .env.synology-hostnet up -d

# Monitor logs
docker-compose -f docker-compose.synology-hostnet.yml logs -f backend
```

### Step 3: Expected Success Output
After pulling the updated image, you should see:
```
✓ Database port 5433 is accessible on localhost!
✓ Database connection successful with psql!
✓ Database setup completed successfully.
🚀 Starting the server...
🔧 Building server...
🔧 Calling start function...
🚀 Starting server on 0.0.0.0:3001...
🚀 Server ready at http://0.0.0.0:3001
```

**No more ES module errors!** ✅

## 🛠️ Alternative: Manual Image Rebuild (If Needed)

If GitHub Actions is having issues, you can manually trigger a build or build locally:

### Option A: Trigger GitHub Actions
1. Go to repository → Actions → "Build and Deploy" workflow
2. Click "Run workflow" → "Run workflow"

### Option B: Build Locally and Push to Registry
```bash
# On your local machine
cd /path/to/qrlinkr

# Build and push backend
docker build -f backend/Dockerfile -t ghcr.io/$GITHUB_REPOSITORY_OWNER/qrlinkr/backend:latest .
docker push ghcr.io/$GITHUB_REPOSITORY_OWNER/qrlinkr/backend:latest

# Build and push frontend
docker build -f frontend/Dockerfile -t ghcr.io/$GITHUB_REPOSITORY_OWNER/qrlinkr/frontend:latest .
docker push ghcr.io/$GITHUB_REPOSITORY_OWNER/qrlinkr/frontend:latest
```

## 📊 Verification Steps

### 1. Confirm Image Update
Check the image timestamp:
```bash
docker images | grep qrlinkr/backend
```

### 2. Test Backend Health
```bash
curl http://192.168.178.13:3001/health
```
Should return: `{"status":"ok","timestamp":"...","uptime":...}`

### 3. Test Frontend
```bash
curl http://192.168.178.13:3000
```
Should return the Next.js homepage HTML.

## 🎯 Root Cause Summary
- ✅ **Network connectivity**: Working perfectly with host networking
- ✅ **TypeScript compilation**: Fixed in source code
- ⏳ **Container deployment**: Waiting for updated Docker image
- ✅ **Database setup**: Working correctly

The only remaining step is getting the **updated Docker image with the ES module fixes** deployed to your Synology NAS.
