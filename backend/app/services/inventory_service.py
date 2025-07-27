# backend/app/services/inventory_service.py

from sqlalchemy.orm import Session
from app.models import Wine

class InventoryService:
    @staticmethod
    def get_all_wines(db: Session):
        return db.query(Wine).all()

    @staticmethod
    def get_low_stock_wines(db: Session, threshold: int = 5):
        return db.query(Wine).filter(Wine.stock <= threshold).all()

    @staticmethod
    def adjust_wine_stock(db: Session, wine_id: int, quantity: int):
        wine = db.query(Wine).filter(Wine.id == wine_id).first()
        if not wine:
            return None
        wine.stock += quantity
        db.commit()
        db.refresh(wine)
        return wine
