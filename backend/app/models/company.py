# backend/app/models/company.py
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship

from app.db import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ✅ Service tables (requires ServiceTable.company_id ForeignKey("companies.id"))
    service_tables = relationship(
        "ServiceTable",
        back_populates="company",
        cascade="all, delete-orphan",
    )

    # If you have other relationships, keep them BELOW and make sure their FKs exist:
    # inventory_items = relationship("InventoryItem", back_populates="company", cascade="all, delete-orphan")
    # wines = relationship("Wine", back_populates="company", cascade="all, delete-orphan")
