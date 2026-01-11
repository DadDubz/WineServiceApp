from pydantic import BaseModel, ConfigDict
from typing import Optional

class InventoryCreate(BaseModel):
    name: str
    quantity: int
    description: Optional[str] = None
    unit: Optional[str] = None
    cost_per_unit: Optional[float] = None
    category: Optional[str] = None
    is_btg: bool = False   # ✅ NEW

class InventoryUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    cost_per_unit: Optional[float] = None
    category: Optional[str] = None
    is_btg: Optional[bool] = None  # ✅ NEW

class InventoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    quantity: int
    company_id: int
    description: Optional[str] = None
    unit: Optional[str] = None
    cost_per_unit: Optional[float] = None
    category: Optional[str] = None
    is_btg: bool = False   # ✅ NEW
