# backend/app/core/config.py
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]  # .../backend
ENV_PATH = BASE_DIR / ".env"


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str = "sqlite:///./app.db"
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # ✅ Accept comma-separated in .env like:
    # CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
    CORS_ORIGINS: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        env_file_encoding="utf-8",
        extra="ignore",  # ✅ ignore unknown env vars instead of crashing
    )

    def cors_origins_list(self) -> List[str]:
        return [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]


settings = Settings()
