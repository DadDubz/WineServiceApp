# backend/app/schemas/company.py

from pydantic import BaseModel

class CompanyCreate(BaseModel):
    name: str

class CompanyOut(CompanyCreate):
    id: int
    class Config:
        orm_mode = True
