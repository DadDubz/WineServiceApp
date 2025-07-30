from fastapi import APIRouter, Depends
from app.dependencies.roles import require_role

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/", dependencies=[Depends(require_role("manager", "owner"))])
def get_reports():
    return {"message": "Access granted to reports"}
