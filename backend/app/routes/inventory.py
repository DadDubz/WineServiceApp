from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.inventory_service import InventoryService
from app.schemas import WineOut
from pydantic import BaseModel

router = APIRouter(prefix="/inventory", tags=["Inventory"])

# GET /inventory/
@router.get("/", response_model=list[WineOut])
def get_inventory(db: Session = Depends(get_db)):
    return InventoryService.get_all_inventory(db)

# GET /inventory/low-stock
@router.get("/low-stock", response_model=list[WineOut])
def get_low_stock_inventory(threshold: int = 5, db: Session = Depends(get_db)):
    return InventoryService.get_low_stock_wines(db, threshold=threshold)

# POST /inventory/adjust
class AdjustStockRequest(BaseModel):
    wine_id: int
    quantity: int  # positive to add, negative to subtract

@router.post("/adjust", response_model=WineOut)
def adjust_inventory(data: AdjustStockRequest, db: Session = Depends(get_db)):
    wine = InventoryService.adjust_wine_stock(db, data.wine_id, data.quantity)
    if not wine:
        raise HTTPException(status_code=404, detail="Wine not found")
    return wine
