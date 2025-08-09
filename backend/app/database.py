# backend/app/database.py
# Re-export common DB objects to maintain backward compatibility with older imports
from app.db import engine, SessionLocal, get_db
from app.models.base import Base
