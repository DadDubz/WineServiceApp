from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.service_log import ServiceLog
from app.models.inventory import InventoryItem
from app.routes.auth import require_role
from datetime import datetime, timedelta

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/", dependencies=[Depends(require_role("manager", "owner"))])
def get_report(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    last_7_days = now - timedelta(days=7)

    service_logs = db.query(ServiceLog).filter(ServiceLog.served_at >= last_7_days).all()
    total_wines_served = len(service_logs)
    wines_by_server: dict[str, int] = {}
    for log in service_logs:
        wines_by_server[log.served_by] = wines_by_server.get(log.served_by, 0) + 1

    inventory = db.query(InventoryItem).all()
    inventory_summary = [
        {"name": item.name, "quantity": item.quantity, "unit": item.unit}
        for item in inventory
    ]

    return {
        "summary": {
            "total_wines_served": total_wines_served,
            "wines_by_server": wines_by_server,
        },
        "inventory": inventory_summary,
    }
