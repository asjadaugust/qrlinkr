# GHCR (GitHub Container Registry) Troubleshooting Guide

## Common Issues and Solutions

### 1. 403 Forbidden Error When Pushing

**Error**: `failed to push ghcr.io/username/repo/backend:main: unexpected status from HEAD request: 403 Forbidden`

**Solutions**:

#### A. Check Repository Visibility
1. Go to your GitHub repository settings
2. Under "General" → "Danger Zone" → "Change repository visibility"
3. Make sure the repository is **Public** (GHCR has issues with private repos in some cases)

#### B. Enable Package Permissions
1. Go to your repository **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select **"Read and write permissions"**
3. Check **"Allow GitHub Actions to create and approve pull requests"**

#### C. Check Package Visibility
1. Go to your GitHub profile → **Packages**
2. If packages exist, click on them and check visibility settings
3. Make sure they're set to **Public** or that your workflow has the right permissions

### 2. Package Not Found Error

**Error**: `failed to pull ghcr.io/username/repo/backend:latest: not found`

**Solutions**:

#### A. Check Package Existence
1. Go to your GitHub profile → **Packages**
2. Look for packages named `repo/backend` and `repo/frontend`
3. If they don't exist, the workflow hasn't successfully pushed yet

#### B. Check Image Tags
1. In the package page, verify the available tags
2. Make sure `latest` tag exists
3. You can also use specific commit SHA tags

### 3. Authentication Issues

**Error**: `authentication required` or `denied: requested access to the resource is denied`

**Solutions**:

#### A. Personal Access Token (if needed)
1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens**
2. Create a token with `write:packages` and `read:packages` permissions
3. Add it as a repository secret named `GHCR_TOKEN`
4. Update the workflow to use `${{ secrets.GHCR_TOKEN }}` instead of `${{ secrets.GITHUB_TOKEN }}`

#### B. Check Workflow Permissions
```yaml
permissions:
  contents: read
  packages: write
  actions: read
```

### 4. Image Path Issues

**Current Configuration**:
- Backend: `ghcr.io/username/repo/backend:latest`
- Frontend: `ghcr.io/username/repo/frontend:latest`

**Make Sure**:
1. Replace `username` with your actual GitHub username
2. Replace `repo` with your actual repository name
3. The format should be: `ghcr.io/OWNER/REPOSITORY/SERVICE:TAG`

### 5. Manual Push Test

Test pushing manually to verify permissions:

```bash
# Build and tag locally
docker build -t ghcr.io/yourusername/qrlinkr/backend:test ./backend

# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u yourusername --password-stdin

# Push test image
docker push ghcr.io/yourusername/qrlinkr/backend:test
```

### 6. Alternative: Use GitHub Username Instead of Repository Variable

If issues persist, you can hardcode the image names in the workflow:

```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME_BACKEND: yourusername/qrlinkr/backend
  IMAGE_NAME_FRONTEND: yourusername/qrlinkr/frontend
```

### 7. Check GitHub Actions Logs

1. Go to your repository → **Actions**
2. Click on the failed workflow run
3. Expand the "Build and push backend image" step
4. Look for specific error messages beyond the 403

### 8. Enable Debug Mode

Add this to your workflow for more detailed logs:

```yaml
env:
  ACTIONS_RUNNER_DEBUG: true
  ACTIONS_STEP_DEBUG: true
```

## Verification Steps

Once fixed, verify the setup:

1. **Check Packages**: Go to your GitHub profile → Packages
2. **Verify Images**: Should see `repo/backend` and `repo/frontend` packages
3. **Test Pull**: Try pulling the image manually:
   ```bash
   docker pull ghcr.io/yourusername/qrlinkr/backend:latest
   ```

4. **Test on Synology**: Deploy using the updated `docker-compose.synology.yml`

## Quick Fix Summary

The most common fix is ensuring:
1. Repository is public
2. Workflow has `packages: write` permission
3. Image paths use the correct format: `ghcr.io/owner/repo/service:tag`
4. `GITHUB_REPOSITORY_OWNER` is set correctly in your `.env` file
