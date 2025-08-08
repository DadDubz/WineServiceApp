from sqlalchemy.orm import Session
from app.models.inventory import InventoryItem
from app.schemas.inventory import InventoryCreate, InventoryUpdate

def get_inventory_items(db: Session, company_id: int):
    return db.query(InventoryItem).filter(InventoryItem.company_id == company_id).all()

def get_inventory_item(db: Session, item_id: int):
    return db.query(InventoryItem).filter(InventoryItem.id == item_id).first()

def create_inventory_item(db: Session, item: InventoryCreate, company_id: int):
    db_item = InventoryItem(**item.dict(), company_id=company_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_inventory_item(db: Session, item_id: int, item: InventoryUpdate):
    db_item = get_inventory_item(db, item_id)
    if db_item:
        for key, value in item.dict(exclude_unset=True).items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_inventory_item(db: Session, item_id: int):
    db_item = get_inventory_item(db, item_id)
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item
