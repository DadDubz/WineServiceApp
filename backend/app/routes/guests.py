# backend/app/routes/guests.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.db import get_db
from app.models.guest import Guest

router = APIRouter(prefix="/guests")

# Schemas
class GuestCreate(BaseModel):
    name: str
    room_number: str | None = None
    table_id: int | None = None
    phone: str | None = None
    email: str | None = None
    allergies: str | None = None
    dietary_restrictions: str | None = None
    protein_preference: str | None = None
    notes: str | None = None

class GuestResponse(BaseModel):
    id: int
    name: str
    room_number: str | None
    table_id: int | None
    phone: str | None
    email: str | None
    allergies: str | None
    dietary_restrictions: str | None
    protein_preference: str | None
    notes: str | None
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[GuestResponse])
def list_guests(db: Session = Depends(get_db)):
    """Get all guests"""
    return db.query(Guest).all()

@router.post("/", response_model=GuestResponse)
def create_guest(guest_data: GuestCreate, db: Session = Depends(get_db)):
    """Create a new guest"""
    guest = Guest(**guest_data.model_dump())
    db.add(guest)
    db.commit()
    db.refresh(guest)
    return guest

@router.get("/{guest_id}", response_model=GuestResponse)
def get_guest(guest_id: int, db: Session = Depends(get_db)):
    """Get a specific guest"""
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    return guest

@router.put("/{guest_id}", response_model=GuestResponse)
def update_guest(guest_id: int, guest_data: GuestCreate, db: Session = Depends(get_db)):
    """Update a guest"""
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    for key, value in guest_data.model_dump().items():
        setattr(guest, key, value)
    
    db.commit()
    db.refresh(guest)
    return guest

@router.delete("/{guest_id}")
def delete_guest(guest_id: int, db: Session = Depends(get_db)):
    """Delete a guest"""
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    db.delete(guest)
    db.commit()
    return {"message": "Guest deleted"}
