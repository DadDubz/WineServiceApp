# backend/app/schemas/service.py
from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel, Field

from app.models.service import TableStatus, WineKind


# ---------- Tables ----------
class TableCreate(BaseModel):
    table_number: str = Field(min_length=1)
    turn: int = 1  # ✅ 1 or 2
    location: Optional[str] = None
    guest_count: int = Field(ge=0, le=50, default=0)
    notes: Optional[str] = None


class TablePatch(BaseModel):
    location: Optional[str] = None
    guest_count: Optional[int] = Field(default=None, ge=0, le=50)
    notes: Optional[str] = None
    # You can include these if you want patching, but I recommend route methods instead:
    status: Optional[TableStatus] = None


class TableListItem(BaseModel):
    id: str
    company_id: int
    service_date: date
    table_number: str
    turn: int

    location: Optional[str] = None
    status: TableStatus

    arrived_at: Optional[datetime] = None
    seated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    step_index: int
    guest_count: int
    updated_at: datetime

    class Config:
        from_attributes = True


class TableListResponse(BaseModel):
    items: List[TableListItem]
    page: int
    limit: int
    total: int


class GuestOut(BaseModel):
    id: str
    table_id: str
    name: Optional[str] = None
    allergy: Optional[str] = None
    protein_sub: Optional[str] = None
    doneness: Optional[str] = None
    substitutions: Optional[str] = None
    notes: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True


class WineEntryOut(BaseModel):
    id: str
    table_id: str
    kind: WineKind
    wine_id: Optional[str] = None
    label: str
    quantity: float
    updated_at: datetime

    class Config:
        from_attributes = True


class TableDetail(BaseModel):
    id: str
    company_id: int
    service_date: date
    table_number: str
    turn: int

    location: Optional[str] = None
    status: TableStatus

    arrived_at: Optional[datetime] = None
    seated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    step_index: int
    guest_count: int
    notes: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    guests: List[GuestOut] = []
    wines: List[WineEntryOut] = []

    class Config:
        from_attributes = True


# ---------- Steps ----------
class StepAdvanceResponse(BaseModel):
    table_id: str
    step_index: int
    updated_at: datetime


# ---------- Guests ----------
class GuestCreate(BaseModel):
    name: Optional[str] = ""
    allergy: Optional[str] = ""
    protein_sub: Optional[str] = ""
    doneness: Optional[str] = None
    substitutions: Optional[str] = None
    notes: Optional[str] = None


class GuestPatch(BaseModel):
    name: Optional[str] = None
    allergy: Optional[str] = None
    protein_sub: Optional[str] = None
    doneness: Optional[str] = None
    substitutions: Optional[str] = None
    notes: Optional[str] = None


# ---------- Wines ----------
class WineEntryCreate(BaseModel):
    kind: WineKind
    wine_id: Optional[str] = None
    label: str = Field(min_length=1)
    quantity: float = Field(ge=0.01, default=1)


class WineEntryPatch(BaseModel):
    label: Optional[str] = None
    quantity: Optional[float] = Field(default=None, ge=0.01)
