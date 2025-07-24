from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.models import ServiceEntry, User
from app.schemas import ServiceCreate, ServiceOut
from app.db import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/service", tags=["Service"])

@router.post("/log", response_model=ServiceOut)
def log_wine_service(
    service_data: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = ServiceEntry(
        wine_name=service_data.wine_name,
        table_number=service_data.table_number,
        quantity=service_data.quantity,
        notes=service_data.notes,
        served_by=current_user.username,
        timestamp=datetime.utcnow()
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/logs", response_model=list[ServiceOut])
def get_service_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ServiceEntry).order_by(ServiceEntry.timestamp.desc()).all()
