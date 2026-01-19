# backend/app/models/service.py
import enum
import uuid
from datetime import datetime, date

from sqlalchemy import (
    Column,
    String,
    Integer,
    Date,
    DateTime,
    Text,
    Float,
    UniqueConstraint,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.db import Base


def utcnow():
    return datetime.utcnow()


class TableStatus(str, enum.Enum):
    OPEN = "open"
    COMPLETED = "completed"


class WineKind(str, enum.Enum):
    BOTTLE = "bottle"
    BTG = "btg"


class StepEventType(str, enum.Enum):
    NEXT = "next"
    UNDO = "undo"
    ARRIVE = "arrive"
    SEAT = "seat"
    COMPLETE = "complete"
    UPDATE = "update"
    GUEST_ADD = "guest_add"
    GUEST_UPDATE = "guest_update"
    GUEST_REMOVE = "guest_remove"
    WINE_ADD = "wine_add"
    WINE_REMOVE = "wine_remove"


class ServiceTable(Base):
    __tablename__ = "service_tables"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # ✅ CRITICAL FIX: real FK to companies.id
    company_id = Column(
        Integer,
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    service_date = Column(Date, nullable=False, default=date.today)
    table_number = Column(String, nullable=False)
    turn = Column(Integer, nullable=False, default=1)

    location = Column(String, nullable=True)

    status = Column(String, nullable=False, default=TableStatus.OPEN.value)

    arrived_at = Column(DateTime, nullable=True)
    seated_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    step_index = Column(Integer, nullable=False, default=0)
    guest_count = Column(Integer, nullable=False, default=0)

    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=utcnow)
    updated_at = Column(DateTime, nullable=False, default=utcnow)

    # relationships
    company = relationship("Company", back_populates="service_tables")
    guests = relationship("ServiceGuest", back_populates="table", cascade="all, delete-orphan")
    wines = relationship("ServiceTableWine", back_populates="table", cascade="all, delete-orphan")
    step_events = relationship("ServiceStepEvent", back_populates="table", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint(
            "company_id",
            "service_date",
            "table_number",
            "turn",
            name="uq_table_use_per_day",
        ),
    )


class ServiceGuest(Base):
    __tablename__ = "service_guests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    table_id = Column(String, ForeignKey("service_tables.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String, nullable=True)
    allergy = Column(String, nullable=True)
    protein_sub = Column(String, nullable=True)
    doneness = Column(String, nullable=True)
    substitutions = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=utcnow)
    updated_at = Column(DateTime, nullable=False, default=utcnow)

    table = relationship("ServiceTable", back_populates="guests")


class ServiceTableWine(Base):
    __tablename__ = "service_table_wines"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    table_id = Column(String, ForeignKey("service_tables.id", ondelete="CASCADE"), nullable=False, index=True)

    kind = Column(String, nullable=False)  # WineKind value
    wine_id = Column(String, nullable=True)  # optional link to your wines table
    label = Column(String, nullable=False)
    quantity = Column(Float, nullable=False, default=1.0)

    created_at = Column(DateTime, nullable=False, default=utcnow)
    updated_at = Column(DateTime, nullable=False, default=utcnow)

    table = relationship("ServiceTable", back_populates="wines")


class ServiceStepEvent(Base):
    __tablename__ = "service_step_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    table_id = Column(String, ForeignKey("service_tables.id", ondelete="CASCADE"), nullable=False, index=True)

    event_type = Column(String, nullable=False)  # StepEventType value
    from_step = Column(Integer, nullable=True)
    to_step = Column(Integer, nullable=True)

    payload = Column(Text, nullable=True)

    # optional actor
    actor_user_id = Column(Integer, nullable=True)

    created_at = Column(DateTime, nullable=False, default=utcnow)

    table = relationship("ServiceTable", back_populates="step_events")
