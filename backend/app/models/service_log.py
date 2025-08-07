# backend/app/models/service_log.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.base import Base


class ServiceLog(Base):
    __tablename__ = "service_logs"

    id = Column(Integer, primary_key=True, index=True)
    wine_id = Column(Integer, ForeignKey("wines.id"), nullable=False)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=False)
    quantity_served = Column(Integer, nullable=False)
    served_by = Column(String, nullable=False)
    served_at = Column(DateTime, default=datetime.utcnow)

    wine = relationship("Wine", back_populates="service_logs")
    table = relationship("Table", back_populates="service_logs")
