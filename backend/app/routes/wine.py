from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.wine import Wine
from app.schemas.wine import WineCreate, WineUpdate, WineOut
from app.auth import get_current_user, require_role
from typing import List

router = APIRouter()

@router.get("/wines", response_model=List[WineOut], dependencies=[Depends(require_role("manager", "owner"))])
def list_wines(db: Session = Depends(get_db)):
    return db.query(Wine).all()

@router.post("/wines", response_model=WineOut, dependencies=[Depends(require_role("manager", "owner"))])
def create_wine(wine_data: WineCreate, db: Session = Depends(get_db)):
    wine = Wine(**wine_data.dict())
    db.add(wine)
    db.commit()
    db.refresh(wine)
    return wine

@router.put("/wines/{wine_id}", response_model=WineOut, dependencies=[Depends(require_role("manager", "owner"))])
def update_wine(wine_id: int, wine_data: WineUpdate, db: Session = Depends(get_db)):
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not wine:
        raise HTTPException(status_code=404, detail="Wine not found")
    for key, value in wine_data.dict(exclude_unset=True).items():
        setattr(wine, key, value)
    db.commit()
    db.refresh(wine)
    return wine

@router.delete("/wines/{wine_id}", dependencies=[Depends(require_role("manager", "owner"))])
def delete_wine(wine_id: int, db: Session = Depends(get_db)):
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not wine:
        raise HTTPException(status_code=404, detail="Wine not found")
    db.delete(wine)
    db.commit()
    return {"message": "Wine deleted"}
