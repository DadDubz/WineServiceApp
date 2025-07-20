from typing import List, Optional

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
