# backend/app/models/table.py

from sqlalchemy import Column, Integer, String
from app.models.base import Base

class Table(Base):
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
