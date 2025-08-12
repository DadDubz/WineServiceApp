from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)

class Wine(Base):
    __tablename__ = "wines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    vintage = Column(String)            # matches your migration change
    region = Column(String)
    varietal = Column(String)
    notes = Column(String)

    # ✅ add this so back_populates on ServiceLog can find it
    service_logs = relationship(
        "ServiceLog",
        back_populates="wine",
        cascade="all, delete-orphan"
    )

class Table(Base):
    __tablename__ = "tables"
    id = Column(Integer, primary_key=True, index=True)
    # your migration replaced number/server/etc with a single "name" column
    name = Column(String, nullable=False)

    # not required, but handy if you want reverse access
    service_logs = relationship(
        "ServiceLog",
        back_populates="table",
        cascade="all, delete-orphan"
    )

class ServiceLog(Base):
    __tablename__ = "service_logs"
    id = Column(Integer, primary_key=True, index=True)
    wine_id = Column(Integer, ForeignKey("wines.id"), nullable=False)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=False)
    quantity_served = Column(Integer, nullable=False)
    served_by = Column(String, nullable=False)
    served_at = Column(DateTime)

    # ✅ these must match the back_populates names above
    wine = relationship("Wine", back_populates="service_logs")
    table = relationship("Table", back_populates="service_logs")
