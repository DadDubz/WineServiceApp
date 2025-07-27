from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas import WineOut
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/", response_model=list[WineOut])
def get_inventory(db: Session = Depends(get_db)):
    return InventoryService.get_all_inventory(db)

@router.get("/low", response_model=list[WineOut])
def get_low_inventory(threshold: int = 5, db: Session = Depends(get_db)):
    return InventoryService.get_low_inventory(db, threshold)

@router.put("/adjust")
def adjust_stock(wine_id: int, quantity: int, db: Session = Depends(get_db)):
    try:
        return InventoryService.adjust_stock(db, wine_id, quantity)
    except HTTPException as e:
        raise e
