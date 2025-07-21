from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth as auth_routes
from app.routes import wines, tables

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(wines.router)
app.include_router(tables.router)
