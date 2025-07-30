# backend/app/routes/roles.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.role import RoleCreate, RoleResponse
from app.crud.role_crud import RoleCRUD

router = APIRouter(prefix="/roles", tags=["Roles"])

@router.post("/", response_model=RoleResponse)
def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    existing_role = RoleCRUD.get_role_by_name(db, role.name)
    if existing_role:
        raise HTTPException(status_code=400, detail="Role already exists")
    return RoleCRUD.create_role(db, role)

@router.get("/", response_model=list[RoleResponse])
def list_roles(db: Session = Depends(get_db)):
    return RoleCRUD.get_all_roles(db)