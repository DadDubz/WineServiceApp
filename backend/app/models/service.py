# backend/app/models/service.py
import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Index,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.db import Base


def uuid_str() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    # Keep consistent timestamps for updated_at, created_at, etc.
    return datetime.utcnow()


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
    """
    Represents ONE "use" of a physical table.

    Reuse rules:
      - You can reuse the same table_number at most twice per day by using turn=1 or turn=2.
      - Enforced by unique constraint: (company_id, service_date, table_number, turn)
    """
    __tablename__ = "service_tables"

    id = Column(String, primary_key=True, default=uuid_str)

    # multi-company isolation
    company_id = Column(Integer, nullable=False, index=True)

    # 1-day service grouping
    service_date = Column(Date, nullable=False, index=True)

    # physical table label: "T1", "T2", etc
    table_number = Column(String, nullable=False, index=True)

    # ✅ reuse a table twice max: 1 or 2
    turn = Column(Integer, nullable=False, default=1)

    location = Column(String, nullable=True)

    status = Column(SAEnum(TableStatus), nullable=False, default=TableStatus.OPEN)

    arrived_at = Column(DateTime, nullable=True)
    seated_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    step_index = Column(Integer, nullable=False, default=0)
    guest_count = Column(Integer, nullable=False, default=0)

    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=utcnow)
    updated_at = Column(DateTime, nullable=False, default=utcnow, index=True)

    guests = relationship(
        "ServiceGuest",
        back_populates="table",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    wines = relationship(
        "ServiceTableWine",
        back_populates="table",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    events = relationship(
        "ServiceStepEvent",
        back_populates="table",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    __table_args__ = (
        # fast "active list" queries
        Index(
            "ix_service_tables_company_date_status_updated",
            "company_id",
            "service_date",
            "status",
            "updated_at",
        ),
        # ✅ enforce table reuse limit per company/day
        UniqueConstraint(
            "company_id",
            "service_date",
            "table_number",
            "turn",
            name="uq_table_use_per_day",
        ),
    )

    def __repr__(self) -> str:
        return f"<ServiceTable id={self.id} table={self.table_number} turn={self.turn} date={self.service_date} status={self.status}>"


class ServiceGuest(Base):
    __tablename__ = "service_guests"

    id = Column(String, primary_key=True, default=uuid_str)
    table_id = Column(
        String,
        ForeignKey("service_tables.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name = Column(String, nullable=True)
    allergy = Column(String, nullable=True)
    protein_sub = Column(String, nullable=True)

    doneness = Column(String, nullable=True)
    substitutions = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=utcnow)
    updated_at = Column(DateTime, nullable=False, default=utcnow, index=True)

    table = relationship("ServiceTable", back_populates="guests")

    def __repr__(self) -> str:
        return f"<ServiceGuest id={self.id} table_id={self.table_id}>"


class ServiceTableWine(Base):
    __tablename__ = "service_table_wines"

    id = Column(String, primary_key=True, default=uuid_str)
    table_id = Column(
        String,
        ForeignKey("service_tables.id", on
