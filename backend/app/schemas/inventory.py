# schemas/inventory.py

from pydantic import BaseModel
from typing import Optional

class InventoryCreate(BaseModel):
    name: str
    quantity: int
    company_id: int

class InventoryUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None

class InventoryOut(BaseModel):
    id: int
    name: str
    quantity: int
    company_id: int

    class Config:
        orm_mode = True
