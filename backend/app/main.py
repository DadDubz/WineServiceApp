from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routes.auth import router as auth_router
from app.routes.wines import router as wines_router
from app.routes.tables import router as tables_router

app = FastAPI()

# Get APP_URL from environment for production CORS
app_url = os.environ.get("APP_URL", "")
frontend_url = app_url if app_url else "http://localhost:5173"

# Allowed origins for CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add production URL if available
if app_url and app_url not in origins:
    origins.append(app_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix for Kubernetes ingress
app.include_router(auth_router, prefix="/api/auth")
app.include_router(wines_router, prefix="/api")
app.include_router(tables_router, prefix="/api")


# Optional health check
@app.get("/api/healthz")
def healthz():
    return {"ok": True}
