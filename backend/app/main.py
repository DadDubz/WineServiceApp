# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth as auth_routes
from app.routes import wines, tables
from app.models import Base  # <-- Add this
from app.db import engine    # <-- And this

app = FastAPI()

# Ensure tables are created
Base.metadata.create_all(bind=engine)  # <-- This creates app.db if not exists

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your routers
app.include_router(auth_routes.router)
app.include_router(wines.router)
app.include_router(tables.router)
