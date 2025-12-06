from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.models.table import Table
from app.models.guest import Guest
from app.db import get_db

router = APIRouter(prefix="/tables")

# Schemas
class TableCreate(BaseModel):
    number: str
    name: str | None = None
    capacity: int = 4
    server: str | None = None
    status: str = "Available"
    notes: str | None = None

class GuestSummary(BaseModel):
    id: int
    name: str
    room_number: str | None
    
    class Config:
        from_attributes = True

class TableResponse(BaseModel):
    id: int
    number: str
    name: str | None
    capacity: int
    server: str | None
    status: str
    notes: str | None
    guests: List[GuestSummary] = []
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[TableResponse])
def get_tables(db: Session = Depends(get_db)):
    """Get all tables with their guests"""
    tables = db.query(Table).all()
    return tables

@router.post("/", response_model=TableResponse)
def create_table(table_data: TableCreate, db: Session = Depends(get_db)):
    """Create a new table"""
    table = Table(**table_data.model_dump())
    db.add(table)
    db.commit()
    db.refresh(table)
    return table

@router.put("/{table_id}")
def update_table(table_id: int, table_data: TableCreate, db: Session = Depends(get_db)):
    """Update a table"""
    table = db.query(Table).filter(Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    for key, value in table_data.model_dump().items():
        setattr(table, key, value)
    
    db.commit()
    db.refresh(table)
    return table

@router.delete("/{table_id}")
def delete_table(table_id: int, db: Session = Depends(get_db)):
    """Delete a table"""
    table = db.query(Table).filter(Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    db.delete(table)
    db.commit()
    return {"message": "Table deleted"}
