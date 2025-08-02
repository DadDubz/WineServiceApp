# backend/app/models/wine.py

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Wine(Base):
    __tablename__ = "wines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    vintage = Column(String, nullable=True)
    varietal = Column(String, nullable=True)
    region = Column(String, nullable=True)
    notes = Column(String, nullable=True)

    # Example of relationship to inventory or service if needed in future
    # inventory_items = relationship("Inventory", back_populates="wine")
