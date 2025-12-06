from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path

from app.routes.auth import router as auth_router
from app.routes.wines import router as wines_router
from app.routes.tables import router as tables_router

app = FastAPI()

# Get APP_URL from environment for production CORS
app_url = os.environ.get("APP_URL", "")
frontend_url = app_url if app_url else "http://localhost:5173"

# Allowed origins for CORS - allow all for development/preview
origins = ["*"]  # Allow all origins for preview environment

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


# Health check
@app.get("/api/healthz")
def healthz():
    return {"ok": True}

# Serve frontend static files (production only)
frontend_dist = Path(__file__).parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Serve index.html for all non-API routes (SPA routing)
        if not full_path.startswith("api/"):
            index_file = frontend_dist / "index.html"
            if index_file.exists():
                return FileResponse(index_file)
        return {"error": "Not found"}
