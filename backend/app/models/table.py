# backend/app/models/table.py

from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.models.base import Base

class Table(Base):
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    number = Column(String, nullable=False)
    server = Column(String, nullable=True)
    capacity = Column(Integer, default=4)
    status = Column(String, default="Available")  # Available, Occupied, Reserved, Cleaning
    notes = Column(Text, nullable=True)
    
    # Relationships
    service_logs = relationship("ServiceLog", back_populates="table")
    guests = relationship("Guest", back_populates="table", cascade="all, delete-orphan")
