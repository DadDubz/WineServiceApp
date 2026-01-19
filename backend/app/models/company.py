# backend/app/models/company.py
from __future__ import annotations

from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship

from app.db import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # --- Relationships that are backed by real FKs in your models ---

    # users.company_id -> companies.id
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")

    # inventory_items.company_id -> companies.id
    inventory_items = relationship(
        "InventoryItem",
        back_populates="company",
        cascade="all, delete-orphan",
    )

    # service_tables.company_id -> companies.id
    service_tables = relationship(
        "ServiceTable",
        back_populates="company",
        cascade="all, delete-orphan",
    )
