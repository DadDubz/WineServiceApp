from sqlalchemy.orm import Session
from app.models.inventory import InventoryItem
from app.schemas.inventory import InventoryCreate, InventoryUpdate

class InventoryService:
    @staticmethod
    def get_all_items(db: Session):
        return db.query(InventoryItem).all()

    @staticmethod
    def get_item_by_id(db: Session, item_id: int):
        return db.query(InventoryItem).filter(InventoryItem.id == item_id).first()

    @staticmethod
    def create_item(db: Session, item_data: InventoryCreate):
        new_item = InventoryItem(**item_data.dict())
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item

    @staticmethod
    def update_item(db: Session, item_id: int, item_data: InventoryUpdate):
        item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
        if item:
            for key, value in item_data.dict(exclude_unset=True).items():
                setattr(item, key, value)
            db.commit()
            db.refresh(item)
        return item

    @staticmethod
    def delete_item(db: Session, item_id: int):
        item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
        if item:
            db.delete(item)
            db.commit()
        return item
