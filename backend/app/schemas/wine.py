from pydantic import BaseModel
from typing import Optional

class WineBase(BaseModel):
    name: str
    vintage: Optional[str] = None
    varietal: Optional[str] = None
    region: Optional[str] = None
    notes: Optional[str] = None

class WineCreate(WineBase):
    pass

class WineUpdate(WineBase):
    pass

class WineOut(WineBase):
    id: int

    class Config:
        orm_mode = True
