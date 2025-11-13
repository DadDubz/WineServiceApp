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
    guests = Column(Integer, default=0)
    status = Column(String, default="Seated")
    courses_json = Column(Text, default="[]")
    
    # Relationships
    service_logs = relationship("ServiceLog", back_populates="table")
