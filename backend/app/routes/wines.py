from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.routes.auth import get_current_user
from app.db import SessionLocal

router = APIRouter(prefix="/wines", tags=["Wines"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.WineOut])
def get_all_wines(db: Session = Depends(get_db)):
    return db.query(models.Wine).all()

@router.post("/", response_model=schemas.WineOut)
def add_wine(wine: schemas.WineCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role not in ["sommelier", "manager"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    new_wine = models.Wine(**wine.dict())
    db.add(new_wine)
    db.commit()
    db.refresh(new_wine)
    return new_wine
