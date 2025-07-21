from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

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
