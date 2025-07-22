from pydantic import BaseModel
from typing import List, Optional

# ---------- Wine Schemas ----------

class WineCreate(BaseModel):
    name: str
    producer: Optional[str] = ""
    type: str
    vintage: int
    region: Optional[str] = ""
    price: int
    stock: int

class WineOut(WineCreate):
    id: int

    class Config:
        orm_mode = True

# ---------- Table Schemas ----------

class TableCreate(BaseModel):
    number: int
    server: str
    guests: int
    status: Optional[str] = "Seated"

class Course(BaseModel):
    name: str
    wine: Optional[str] = ""
    status: Optional[str] = "Ordered"

class TableOut(BaseModel):
    id: int
    number: int
    server: str
    guests: int
    status: str
    courses: List[Course]

    class Config:
        orm_mode = True

# ---------- Auth Token Schema ----------

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
