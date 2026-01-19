# backend/app/core/config.py
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ✅ dev default so alembic/cli won't crash if env not loaded
    SECRET_KEY: str = "dev-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str = "sqlite:///./app.db"
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # ✅ IMPORTANT: when you run from backend/, env_file should be ".env"
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
