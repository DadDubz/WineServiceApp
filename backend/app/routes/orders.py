# backend/app/routes/orders.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.db import get_db
from app.models.order import Order

router = APIRouter(prefix="/orders")

# Schemas
class OrderCreate(BaseModel):
    guest_id: int
    wine_id: int | None = None
    item_type: str
    item_name: str
    quantity: int = 1
    price: float | None = None
    notes: str | None = None
    substitutions: str | None = None

class OrderResponse(BaseModel):
    id: int
    guest_id: int
    wine_id: int | None
    item_type: str
    item_name: str
    quantity: int
    price: float | None
    notes: str | None
    substitutions: str | None
    status: str
    ordered_at: datetime
    served_at: datetime | None
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[OrderResponse])
def list_orders(guest_id: int | None = None, db: Session = Depends(get_db)):
    """Get all orders, optionally filtered by guest"""
    query = db.query(Order)
    if guest_id:
        query = query.filter(Order.guest_id == guest_id)
    return query.all()

@router.post("/", response_model=OrderResponse)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order"""
    order = Order(**order_data.model_dump())
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

@router.put("/{order_id}/status")
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    """Update order status"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status
    if status == "served":
        order.served_at = datetime.utcnow()
    
    db.commit()
    return {"message": "Order status updated", "status": status}

@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete an order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db.delete(order)
    db.commit()
    return {"message": "Order deleted"}
