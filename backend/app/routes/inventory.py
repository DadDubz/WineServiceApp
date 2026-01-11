from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryOut
from app.services import inventory_service
from app.models.user import User

# import your existing helper from auth routes
from app.routes.auth import get_current_user  # adjust path if yours is different

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/", response_model=list[InventoryOut])
def read_inventory(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="User has no company assigned")
    return inventory_service.get_inventory_items(db, current_user.company_id)

@router.post("/", response_model=InventoryOut)
def create_item(
    item: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="User has no company assigned")
    return inventory_service.create_inventory_item(db, item, current_user.company_id)

@router.put("/{item_id}", response_model=InventoryOut)
def update_item(
    item_id: int,
    item: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # optional: you can enforce item belongs to user's company inside service
    return inventory_service.update_inventory_item(db, item_id, item)

@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inventory_service.delete_inventory_item(db, item_id)
    return {"ok": True}
