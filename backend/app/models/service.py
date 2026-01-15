import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SAEnum, ForeignKey, Integer, Numeric, String, Text, Index
from sqlalchemy.orm import relationship

from app.db import Base


def uuid_str() -> str:
    return str(uuid.uuid4())


class TableStatus(str, Enum):
    OPEN = "OPEN"
    COMPLETED = "COMPLETED"
    CANCELED = "CANCELED"


class WineKind(str, Enum):
    BOTTLE = "BOTTLE"
    BTG = "BTG"


class StepEventType(str, Enum):
    NEXT = "NEXT"
    UNDO = "UNDO"
    ARRIVE = "ARRIVE"
    SEAT = "SEAT"
    COMPLETE = "COMPLETE"
    UPDATE = "UPDATE"
    WINE_ADD = "WINE_ADD"
    WINE_REMOVE = "WINE_REMOVE"
    GUEST_ADD = "GUEST_ADD"
    GUEST_UPDATE = "GUEST_UPDATE"
    GUEST_REMOVE = "GUEST_REMOVE"


class ServiceTable(Base):
    __tablename__ = "service_tables"

    id = Column(String, primary_key=True, default=uuid_str)

    # (optional) if you want multi-company isolation later:
    company_id = Column(Integer, nullable=True, index=True)

    table_number = Column(String, nullable=False, index=True)
    location = Column(String, nullable=True)

    status = Column(SAEnum(TableStatus), nullable=False, default=TableStatus.OPEN)

    arrived_at = Column(DateTime, nullable=True)
    seated_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    step_index = Column(Integer, nullable=False, default=0)
    guest_count = Column(Integer, nullable=False, default=0)

    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)

    guests = relationship("ServiceGuest", back_populates="table", cascade="all, delete-orphan")
    wines = relationship("ServiceTableWine", back_populates="table", cascade="all, delete-orphan")
    events = relationship("ServiceStepEvent", back_populates="table", cascade="all, delete-orphan")


Index("ix_service_tables_status_updated", ServiceTable.status, ServiceTable.updated_at)


class ServiceGuest(Base):
    __tablename__ = "service_guests"

    id = Column(String, primary_key=True, default=uuid_str)
    table_id = Column(String, ForeignKey("service_tables.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String, nullable=True)
    allergy = Column(String, nullable=True)
    protein_sub = Column(String, nullable=True)

    doneness = Column(String, nullable=True)
    substitutions = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)

    table = relationship("ServiceTable", back_populates="guests")


class ServiceTableWine(Base):
    __tablename__ = "service_table_wines"

    id = Column(String, primary_key=True, default=uuid_str)
    table_id = Column(String, ForeignKey("service_tables.id", ondelete="CASCADE"), nullable=False, index=True)

    kind = Column(SAEnum(WineKind), nullable=False)
    wine_id = Column(String, nullable=True)  # optional linkage to inventory model later
    label = Column(String, nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False, default=1)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)

    table = relationship("ServiceTable", back_populates="wines")


class ServiceStepEvent(Base):
    __tablename__ = "service_step_events"

    id = Column(String, primary_key=True, default=uuid_str)
    table_id = Column(String, ForeignKey("service_tables.id", ondelete="CASCADE"), nullable=False, index=True)

    event_type = Column(SAEnum(StepEventType), nullable=False)
    from_step = Column(Integer, nullable=True)
    to_step = Column(Integer, nullable=True)

    payload = Column(Text, nullable=True)  # JSON string
    actor_user_id = Column(Integer, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    table = relationship("ServiceTable", back_populates="events")
