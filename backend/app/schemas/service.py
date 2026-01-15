from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class TableStatus(str, Enum):
    OPEN = "OPEN"
    COMPLETED = "COMPLETED"
    CANCELED = "CANCELED"


class WineKind(str, Enum):
    BOTTLE = "BOTTLE"
    BTG = "BTG"


# -------- Tables --------
class TableCreate(BaseModel):
    table_number: str = Field(min_length=1)
    location: Optional[str] = None
    guest_count: int = 0
    notes: Optional[str] = None


class TablePatch(BaseModel):
    table_number: Optional[str] = None
    location: Optional[str] = None
    guest_count: Optional[int] = None
    notes: Optional[str] = None


class TableListItem(BaseModel):
    id: str
    table_number: str
    location: Optional[str] = None
    status: TableStatus
    step_index: int
    guest_count: int
    arrived_at: Optional[datetime] = None
    seated_at: Optional[datetime] = None
    updated_at: datetime

    class Config:
        from_attributes = True


class TableListResponse(BaseModel):
    items: List[TableListItem]
    page: int
    limit: int
    total: int


# -------- Guests --------
class GuestCreate(BaseModel):
    name: Optional[str] = None
    allergy: Optional[str] = None
    protein_sub: Optional[str] = None
    doneness: Optional[str] = None
    substitutions: Optional[str] = None
    notes: Optional[str] = None


class GuestPatch(GuestCreate):
    pass


class GuestOut(GuestCreate):
    id: str
    updated_at: datetime

    class Config:
        from_attributes = True


# -------- Wines --------
class WineEntryCreate(BaseModel):
    kind: WineKind
    wine_id: Optional[str] = None
    label: str = Field(min_length=1)
    quantity: float = 1.0


class WineEntryPatch(BaseModel):
    label: Optional[str] = None
    quantity: Optional[float] = None


class WineEntryOut(BaseModel):
    id: str
    kind: WineKind
    wine_id: Optional[str] = None
    label: str
    quantity: float
    updated_at: datetime

    class Config:
        from_attributes = True


# -------- Details --------
class StepEventOut(BaseModel):
    id: str
    event_type: str
    from_step: Optional[int] = None
    to_step: Optional[int] = None
    payload: Optional[str] = None
    actor_user_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TableDetail(BaseModel):
    id: str
    table_number: str
    location: Optional[str] = None
    status: TableStatus
    step_index: int
    guest_count: int
    notes: Optional[str] = None

    arrived_at: Optional[datetime] = None
    seated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    created_at: datetime
    updated_at: datetime

    guests: List[GuestOut] = []
    wines: List[WineEntryOut] = []
    events: List[StepEventOut] = []

    class Config:
        from_attributes = True


class StepAdvanceResponse(BaseModel):
    table_id: str
    step_index: int
    updated_at: datetime
