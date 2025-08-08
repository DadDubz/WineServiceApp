from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryOut
from app.services import inventory_service

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/", response_model=list[InventoryOut])
def read_inventory(company_id: int, db: Session = Depends(get_db)):
    return inventory_service.get_inventory_items(db, company_id)

@router.post("/", response_model=InventoryOut)
def create_item(item: InventoryCreate, company_id: int, db: Session = Depends(get_db)):
    return inventory_service.create_inventory_item(db, item, company_id)

@router.put("/{item_id}", response_model=InventoryOut)
def update_item(item_id: int, item: InventoryUpdate, db: Session = Depends(get_db)):
    return inventory_service.update_inventory_item(db, item_id, item)

@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    inventory_service.delete_inventory_item(db, item_id)
    return {"ok": True}
