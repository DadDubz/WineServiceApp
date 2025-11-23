# Multi-stage Dockerfile for Wine Service App
# This builds both frontend and backend in a single container

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /build

# Copy entire frontend directory
COPY frontend ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Build the frontend
RUN yarn build

# Stage 2: Production Runtime
FROM python:3.11-slim

# Install system dependencies including Node.js for serve
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g serve \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend code
COPY backend ./backend

# Install Python dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy frontend build from builder stage
COPY --from=frontend-builder /build/dist ./frontend/dist

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV SECRET_KEY=wine-service-secret-key-change-in-production
ENV ACCESS_TOKEN_EXPIRE_MINUTES=120

# Expose ports
EXPOSE 8000 3000

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
echo "Initializing database..."\n\
cd /app/backend && python init_db.py\n\
echo "Starting backend..."\n\
cd /app/backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 &\n\
BACKEND_PID=$!\n\
echo "Starting frontend..."\n\
serve -s /app/frontend/dist -l 3000 &\n\
FRONTEND_PID=$!\n\
echo "All services started!"\n\
wait $BACKEND_PID $FRONTEND_PID\n\
' > /app/start.sh && chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/api/healthz || exit 1

# Start both services
CMD ["/app/start.sh"]
