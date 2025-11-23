# 🍷 Wine Service App - Deployment Guide

## Quick Deployment Options

### Option 1: Docker Compose (Recommended for Local)

```bash
# Build and start the app
docker-compose up --build

# Access the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api
```

### Option 2: Docker Single Container

```bash
# Build the image
docker build -t wine-service-app .

# Run the container
docker run -p 8000:8000 -p 3000:3000 wine-service-app

# Access the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api
```

### Option 3: GitHub Actions (Automated CI/CD)

The repository includes a GitHub Actions workflow (`.github/workflows/docker-build.yml`) that automatically:
- Builds the Docker image on every push to main/master
- Runs basic health checks
- Can push to Docker Hub (optional - requires secrets)

**To enable Docker Hub push:**
1. Go to your GitHub repository settings
2. Add secrets:
   - `DOCKER_USERNAME` - Your Docker Hub username
   - `DOCKER_PASSWORD` - Your Docker Hub password or access token
3. Push to main branch - image will auto-build and push

### Option 4: Cloud Deployment

#### Render.com
1. Create new Web Service
2. Connect your GitHub repository
3. Use Docker environment
4. Set environment variables:
   - `SECRET_KEY=your-secret-key`
   - `ACCESS_TOKEN_EXPIRE_MINUTES=120`
5. Deploy!

#### Railway.app
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Heroku
```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create your-wine-service-app

# Deploy
git push heroku main
```

#### Fly.io
```bash
# Install flyctl and login
curl -L https://fly.io/install.sh | sh
flyctl auth login

# Launch
flyctl launch
flyctl deploy
```

## Environment Variables

Required variables for production:

```env
# Backend
SECRET_KEY=your-super-secret-jwt-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=120
DATABASE_URL=sqlite:///./app.db

# Frontend (build time)
VITE_API_BASE_URL=https://your-domain.com/api
```

## Production Considerations

### Database
- Current setup uses SQLite (file-based)
- For production, consider PostgreSQL:
  ```bash
  # Update requirements.txt
  psycopg2-binary==2.9.9
  
  # Update DATABASE_URL
  DATABASE_URL=postgresql://user:pass@host:5432/dbname
  ```

### Security
- Change `SECRET_KEY` to a strong random value
- Enable HTTPS
- Set proper CORS origins in `backend/app/main.py`
- Use environment variables for all secrets

### Scaling
- Use a reverse proxy (Nginx, Traefik)
- Separate frontend and backend containers
- Use managed database service
- Implement caching (Redis)

## Troubleshooting

### Port Conflicts
If ports 8000 or 3000 are already in use:
```bash
docker run -p 8080:8000 -p 3001:3000 wine-service-app
```

### Database Issues
Reset the database:
```bash
docker exec -it <container-id> rm /app/backend/app.db
docker exec -it <container-id> python /app/backend/init_db.py
```

### Build Failures
Clear Docker cache:
```bash
docker system prune -a
docker-compose build --no-cache
```

## Demo Credentials

- **manager1** / pass - Full manager access
- **sommelier1** / pass - Wine management
- **expo1** / pass - Service access
- **server1** / pass - Server role

## Monitoring

Check container logs:
```bash
docker logs <container-id>
docker-compose logs -f wine-service
```

Health check:
```bash
curl http://localhost:8000/api/healthz
```

## Support

For issues or questions, refer to:
- Main README.md
- SETUP_COMPLETE.md
- GitHub Issues

---

**Built with ❤️ for premium wine service management**
