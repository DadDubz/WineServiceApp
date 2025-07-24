from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db import Base
from datetime import datetime



class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String)

class Wine(Base):
    __tablename__ = "wines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    producer = Column(String)
    type = Column(String)  # Red, White, etc.
    vintage = Column(Integer)
    region = Column(String)
    price = Column(Integer)
    stock = Column(Integer)

class Table(Base):
    __tablename__ = "tables"
    id = Column(Integer, primary_key=True, index=True)
    number = Column(Integer)
    server = Column(String)
    guests = Column(Integer)
    status = Column(String)  # Seated, Finished
    courses_json = Column(String)  # JSON string of course objects

class Service(Base):
    __tablename__ = "service"

    id = Column(Integer, primary_key=True, index=True)
    wine_name = Column(String, nullable=False)
    table_number = Column(Integer, nullable=False)
    served_by = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    notes = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

from sqlalchemy import Column, Integer, String, DateTime
from app.db import Base
from datetime import datetime

class ServiceEntry(Base):
    __tablename__ = "service_logs"

    id = Column(Integer, primary_key=True, index=True)
    wine_name = Column(String, nullable=False)
    table_number = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    notes = Column(String, nullable=True)
    served_by = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)