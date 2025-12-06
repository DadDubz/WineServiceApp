# backend/app/models/guest.py

from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import Base

class Guest(Base):
    __tablename__ = "guests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    room_number = Column(String, nullable=True)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    
    # Preferences and notes
    allergies = Column(Text, nullable=True)
    dietary_restrictions = Column(Text, nullable=True)
    protein_preference = Column(String, nullable=True)  # rare, medium, well-done
    notes = Column(Text, nullable=True)
    
    # Relationships
    table = relationship("Table", back_populates="guests")
    orders = relationship("Order", back_populates="guest", cascade="all, delete-orphan")
