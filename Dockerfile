# Multi-stage Dockerfile for Wine Service App
# This builds both frontend and backend in a single container

FROM node:20-alpine AS frontend-build

# Build frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY frontend/ ./
RUN yarn build

FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy frontend build from previous stage
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Install serve to serve frontend
RUN npm install -g serve

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Expose ports
EXPOSE 8000 3000

# Create startup script
RUN echo '#!/bin/sh\n\
cd /app/backend && python init_db.py &\n\
cd /app/backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 &\n\
serve -s /app/frontend/dist -l 3000\n\
' > /app/start.sh && chmod +x /app/start.sh

# Start both services
CMD ["/app/start.sh"]
