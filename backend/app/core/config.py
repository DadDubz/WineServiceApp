# app/core/config.py
from pydantic import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = "sqlite:///./app.db"
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    class Config:
        env_file = "backend/.env"  # relative to repo root when you run from there
        env_file_encoding = "utf-8"

settings = Settings()
