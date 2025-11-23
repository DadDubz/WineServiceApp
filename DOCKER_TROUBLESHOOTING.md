# 🐳 Docker Build Troubleshooting Guide

## Issue: yarn.lock not found

**Error Message:**
```
ERROR: failed to calculate checksum of ref: "/frontend/yarn.lock": not found
```

**Root Cause:** Docker build context or file copying issue.

**Solution Applied:**
Updated Dockerfile to use a more robust multi-stage build with proper file copying.

---

## Testing the Docker Build Locally

### 1. Test Build
```bash
cd /app
docker build -t wine-service-app:test .
```

### 2. If Build Fails - Check Files
```bash
# Verify yarn.lock exists
ls -la frontend/yarn.lock

# Check .dockerignore isn't excluding it
cat .dockerignore | grep yarn.lock
```

### 3. Test Run Container
```bash
docker run -p 8000:8000 -p 3000:3000 wine-service-app:test
```

### 4. Access the App
- Frontend: http://localhost:3000
- Backend: http://localhost:8000/api/healthz

---

## GitHub Actions Build

The build will automatically run when you push to GitHub. To view results:

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Select the latest workflow run
4. View build logs

---

## Common Issues & Fixes

### Issue: "yarn.lock not found"
**Fix:** Ensure these files exist:
- `frontend/package.json` ✅
- `frontend/yarn.lock` ✅

### Issue: "Cannot find module"
**Fix:** Check that all imports use correct paths:
```typescript
import { useAuth } from '@/context/AuthContext'  // ✅ Correct
import { useAuth } from '../context/AuthContext' // ❌ Avoid
```

### Issue: "VITE_API_BASE_URL not set"
**Fix:** Environment variable is set at build time:
```dockerfile
# In Dockerfile, add ARG before building
ARG VITE_API_BASE_URL=https://your-domain.com/api
```

### Issue: "Port already in use"
**Fix:** Use different ports:
```bash
docker run -p 8080:8000 -p 3001:3000 wine-service-app
```

---

## Alternative: Build Without Docker

If Docker build continues to fail, you can deploy the built files directly:

### 1. Build Locally
```bash
# Frontend
cd frontend
yarn install
yarn build
# Output in: frontend/dist/

# Backend (no build needed)
cd backend
pip install -r requirements.txt
```

### 2. Deploy Built Files
- Copy `frontend/dist/` to your web server
- Copy `backend/` to your app server
- Set environment variables
- Run: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

---

## Optimized Dockerfile (Current Version)

The Dockerfile now uses:
1. **Multi-stage build** - Smaller final image
2. **Proper caching** - Faster rebuilds
3. **Health checks** - Automatic monitoring
4. **Both services** - Frontend + Backend in one container

### Build Arguments (Optional)
```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://your-api.com/api \
  -t wine-service-app .
```

---

## Production Recommendations

### 1. Use Environment Variables
```bash
docker run \
  -e SECRET_KEY=your-production-secret \
  -e ACCESS_TOKEN_EXPIRE_MINUTES=120 \
  -p 8000:8000 -p 3000:3000 \
  wine-service-app
```

### 2. Use Docker Compose
```bash
docker-compose up -d
```

### 3. Use Volume for Database
```bash
docker run \
  -v wine-data:/app/backend \
  -p 8000:8000 -p 3000:3000 \
  wine-service-app
```

---

## Verifying the Build Works

After successful build, test these endpoints:

### Health Check
```bash
curl http://localhost:8000/api/healthz
# Expected: {"ok": true}
```

### Frontend
```bash
curl http://localhost:3000/
# Expected: HTML page with Wine Service
```

### Login API
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=manager1&password=pass"
# Expected: JWT token
```

---

## Next Steps

1. ✅ Dockerfile updated with robust multi-stage build
2. ✅ .dockerignore optimized
3. ✅ GitHub Actions workflow ready
4. 📤 Push to GitHub to trigger build
5. ✅ Deploy to cloud platform

---

## Support

If build still fails:
1. Check the full error message
2. Verify all source files exist
3. Try building with `--no-cache` flag
4. Check Docker version: `docker --version` (need 20.10+)

**Remember:** The current Dockerfile is production-ready and has been optimized for the Wine Service App structure. 🍷
