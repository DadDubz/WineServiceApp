# backend/app/core/config.py
from __future__ import annotations

from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    App configuration loaded from environment variables and .env

    - For local dev, create backend/.env with values below.
    - For production, set env vars in Render/Vercel/etc.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Core ---
    ENV: str = Field(default="dev")
    SECRET_KEY: str = Field(default="dev-secret-change-me-please")

    # --- DB ---
    DATABASE_URL: str = Field(default="sqlite:///./app.db")

    # --- CORS ---
    # Use one of these styles:
    # 1) CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
    # 2) CORS_ORIGINS="*"   (allow all, dev only)
    CORS_ORIGINS: str = Field(default="http://localhost:5173,http://127.0.0.1:5173")

    # Optional convenience if you use it elsewhere
    APP_URL: Optional[str] = Field(default=None)

    def cors_origins_list(self) -> List[str]:
        """
        Returns a list of allowed CORS origins.
        Supports:
          - "*" for allow-all
          - Comma-separated URLs
        """
        raw = (self.CORS_ORIGINS or "").strip()
        if not raw:
            return ["http://localhost:5173"]

        if raw == "*":
            return ["*"]

        return [o.strip() for o in raw.split(",") if o.strip()]


settings = Settings()
