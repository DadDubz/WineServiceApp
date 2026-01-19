# backend/app/models/user.py
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)

    hashed_password = Column(String, nullable=False)

    # Examples: "server", "expo", "sommelier", "manager", "admin"
    role = Column(String, nullable=False, default="server")

    # ✅ Make nullable to avoid Alembic failing when existing users have NULL company_id
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    company = relationship("Company", back_populates="users")
