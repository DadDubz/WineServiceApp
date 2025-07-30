from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Wine, ServiceLog
from app.dependencies.roles import require_role
from datetime import datetime

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/stock", dependencies=[Depends(require_role("manager", "owner"))])
def wine_stock_report(db: Session = Depends(get_db)):
    wines = db.query(Wine).all()
    return [{"name": wine.name, "stock": wine.stock, "type": wine.type, "price": wine.price} for wine in wines]

@router.get("/service", dependencies=[Depends(require_role("manager", "owner"))])
def wine_service_report(db: Session = Depends(get_db)):
    logs = db.query(ServiceLog).order_by(ServiceLog.timestamp.desc()).all()
    return [
        {
            "wine": log.wine_name,
            "table": log.table_number,
            "quantity": log.quantity,
            "served_by": log.served_by,
            "notes": log.notes,
            "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M"),
        }
        for log in logs
    ]
