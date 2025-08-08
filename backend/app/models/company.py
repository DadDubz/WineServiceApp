# backend/app/models/company.py

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.models.base import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)

    users = relationship("User", back_populates="company")
    inventory_items = relationship("InventoryItem", back_populates="company", cascade="all, delete")