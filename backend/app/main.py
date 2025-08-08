# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import Base
from app.db import engine
from app.routes import auth, wines, tables, service, inventory
from app.routes import roles
from app.routes import reports
from app.routes import report
load_dotenv()
from app.routes import report
from dotenv import load_dotenv

app = FastAPI()
Base.metadata.create_all(bind=engine)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your routers
app.include_router(auth.router)
app.include_router(wines.router)
app.include_router(tables.router)
app.include_router(service.router)
app.include_router(roles.router)
app.include_router(reports.router)
app.include_router(inventory.router)
