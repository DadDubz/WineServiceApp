from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from ..models.service_log import ServiceLog
from ..models.inventory import InventoryItem
from app.dependencies import require_role
from datetime import datetime, timedelta

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/", dependencies=[Depends(require_role("manager", "owner"))])
def get_report(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    last_7_days = now - timedelta(days=7)

    # 1. Wine Service Summary
    service_logs = db.query(ServiceLog).filter(ServiceLog.timestamp >= last_7_days).all()
    total_wines_served = len(service_logs)
    wines_by_server = {}
    for log in service_logs:
        wines_by_server[log.user_id] = wines_by_server.get(log.user_id, 0) + 1

    # 2. Inventory Snapshot
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
