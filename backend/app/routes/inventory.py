from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Wine
from app.schemas import WineCreate, WineOut

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.post("/", response_model=WineOut)
def add_wine(wine: WineCreate, db: Session = Depends(get_db)):
    db_wine = Wine(**wine.dict())
    db.add(db_wine)
    db.commit()
    db.refresh(db_wine)
    return db_wine

@router.get("/", response_model=list[WineOut])
def get_inventory(db: Session = Depends(get_db)):
    return db.query(Wine).all()

@router.put("/{wine_id}", response_model=WineOut)
def update_wine(wine_id: int, wine: WineCreate, db: Session = Depends(get_db)):
    db_wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not db_wine:
        raise HTTPException(status_code=404, detail="Wine not found")
    for key, value in wine.dict().items():
        setattr(db_wine, key, value)
    db.commit()
    db.refresh(db_wine)
    return db_wine

@router.delete("/{wine_id}")
def delete_wine(wine_id: int, db: Session = Depends(get_db)):
    db_wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not db_wine:
        raise HTTPException(status_code=404, detail="Wine not found")
    db.delete(db_wine)
    db.commit()
    return {"detail": "Wine deleted"}
