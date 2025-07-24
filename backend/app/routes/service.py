from fastapi import APIRouter, Depends
from app.routes.auth import get_current_user

router = APIRouter()

@router.get("/service/orders")
def get_orders(current_user=Depends(get_current_user)):
    return {
        "message": f"Hello, {current_user.username}. Here's your order list.",
        "role": current_user.role
    }
