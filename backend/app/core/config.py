# backend/app/core/config.py
from __future__ import annotations

import os
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """
    Central settings object.
    Reads from environment variables + optional .env file.
    """

    # --- App ---
    APP_NAME: str = "WineServiceApp"
    ENV: str = Field(default="development")  # development | production | test
    APP_URL: str = Field(default="http://localhost:5173")

    # --- Security / JWT ---
    SECRET_KEY: str = Field(default="dev-secret-change-me-please")
    JWT_SECRET: str = Field(default="dev-secret-change-me-please")
    JWT_ALG: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60 * 24)  # 24h

    # --- Database ---
    # For sqlite, alembic typically wants sqlite:///./app.db
    DATABASE_URL: str = Field(default="sqlite:///./app.db")

    # --- CORS ---
    # Allow comma-separated list OR *
    CORS_ORIGINS: str = Field(default="*")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def cors_origins_list(self) -> List[str]:
        """
        Return allowed CORS origins as a list.
        Supports:
        - "*" (allow all)
        - "http://a.com,http://b.com"
        """
        raw = (self.CORS_ORIGINS or "").strip()
        if not raw:
            return ["*"]
        if raw == "*":
            return ["*"]
        return [o.strip() for o in raw.split(",") if o.strip()]


settings = Settings()
