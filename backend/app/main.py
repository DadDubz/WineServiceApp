# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

from app.routes.auth import router as auth_router
from app.routes.wines import router as wines_router
from app.routes.tables import router as tables_router
from app.routes.guests import router as guests_router
from app.routes.orders import router as orders_router
from app.routes.service import router as service_router

app = FastAPI(title="WineServiceApp API")

# CORS
origins = settings.cors_origins_list()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router, prefix="/api/auth")
app.include_router(wines_router, prefix="/api")
app.include_router(tables_router, prefix="/api")
app.include_router(guests_router, prefix="/api")
app.include_router(orders_router, prefix="/api")
app.include_router(service_router, prefix="/api")
