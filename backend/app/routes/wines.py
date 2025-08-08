from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models
from app.routes.auth import get_current_user
from app.db import get_db
from app.schemas.schemas import WineCreate, WineOut

router = APIRouter(prefix="/wines", tags=["Wines"])

@router.get("/", response_model=list[WineOut])
def get_all_wines(db: Session = Depends(get_db)):
    return db.query(models.Wine).all()

@router.post("/", response_model=WineOut)
def add_wine(wine: WineCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role not in ["sommelier", "manager"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    new_wine = models.Wine(**wine.dict())
    db.add(new_wine)
    db.commit()
    db.refresh(new_wine)
    return new_wine
