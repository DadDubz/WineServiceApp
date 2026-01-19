# backend/app/models/user.py
import enum
from sqlalchemy import Column, Integer, String, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import relationship

from app.db import Base


class UserRole(str, enum.Enum):
    expo = "expo"
    sommelier = "sommelier"
    manager = "manager"
    server = "server"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)

    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.server)

    # ✅ make nullable for testing so existing rows don't break migrations
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)

    company = relationship("Company", back_populates="users")
