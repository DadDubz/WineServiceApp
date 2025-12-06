# backend/app/models/order.py

from sqlalchemy import Column, Integer, String, ForeignKey, Text, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    guest_id = Column(Integer, ForeignKey("guests.id"), nullable=False)
    wine_id = Column(Integer, ForeignKey("wines.id"), nullable=True)
    
    # Order details
    item_type = Column(String, nullable=False)  # wine, cheese_board, appetizer, etc.
    item_name = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    price = Column(Float, nullable=True)
    
    # Special requests
    notes = Column(Text, nullable=True)
    substitutions = Column(Text, nullable=True)
    
    # Status and timing
    status = Column(String, default="ordered")  # ordered, preparing, served, completed
    ordered_at = Column(DateTime, default=datetime.utcnow)
    served_at = Column(DateTime, nullable=True)
    
    # Relationships
    guest = relationship("Guest", back_populates="orders")
    wine = relationship("Wine", backref="orders")
