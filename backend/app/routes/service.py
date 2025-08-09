from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.service_log import ServiceLog
from app.models.user import User
from app.schemas.schemas import ServiceCreate, ServiceOut
from app.db import get_db
from app.routes.auth import get_current_user

router = APIRouter(prefix="/service", tags=["Service"])

@router.post("/log", response_model=ServiceOut)
def log_wine_service(
    service_data: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = ServiceLog(
        wine_id=0,  # TODO: map by name if needed
        table_id=service_data.table_number,
        quantity_served=service_data.quantity,
        served_by=current_user.username,
        served_at=datetime.utcnow()
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
    return db.query(ServiceLog).order_by(ServiceLog.served_at.desc()).all()
