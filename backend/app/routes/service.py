from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.auth import get_current_user
from app.db import get_db
from app import models, schemas

router = APIRouter(prefix="/service", tags=["Service"])

@router.post("/", response_model=schemas.ServiceOut)
def log_wine_service(
    service_data: schemas.ServiceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role not in ["sommelier", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    service_entry = models.Service(
        wine_name=service_data.wine_name,
        table_number=service_data.table_number,
        served_by=current_user.username,
        quantity=service_data.quantity,
        notes=service_data.notes
    )
    db.add(service_entry)
    db.commit()
    db.refresh(service_entry)
    return service_entry
