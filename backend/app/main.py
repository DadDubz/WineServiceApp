# backend/app/main.py
from __future__ import annotations

import os
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Try to load settings if you have app.core.config; otherwise fall back to env/defaults.
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

# Collect allowed origins: explicit dev hosts + optional FRONTEND_ORIGIN
default_origins: List[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if FRONTEND_ORIGIN and FRONTEND_ORIGIN not in default_origins:
    default_origins.append(FRONTEND_ORIGIN)

app = FastAPI(
    title="Wine Service API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS (match your Vite dev URL and any FRONTEND_ORIGIN from .env)
app.add_middleware(
    CORSMiddleware,
    allow_origins=default_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Router includes (won't crash if a module is missing) ----

def _try_include(module_path: str, attr: str = "router"):
    """
    Import a module by path and include its FastAPI `router` if present.
    Example: _try_include("app.routes.auth")  # expects `router` inside
    """
    try:
        mod = __import__(module_path, fromlist=[attr])
        router = getattr(mod, attr, None)
        if router is not None:
            app.include_router(router)
    except Exception as e:
        # Keep the API booting even if a router is temporarily broken/missing.
        # You can log this if you have logging configured.
        pass

_try_include("app.routes.auth")
_try_include("app.routes.wines")
_try_include("app.routes.tables")
_try_include("app.routes.inventory")  # harmless if you don’t have it yet

# ---- Simple health & root endpoints ----

@app.get("/", tags=["meta"])
def root():
    return {"ok": True, "message": "Wine Service API is running", "docs": "/docs"}

@app.get("/health", tags=["meta"])
def health():
    return {"status": "healthy"}


# Optional: tighter 500s without leaking internals
@app.exception_handler(Exception)
async def unhandled_exception_handler(_, exc: Exception):
    # Add logging here if you have a logger
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})
