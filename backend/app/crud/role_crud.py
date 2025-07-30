# backend/app/crud/role_crud.py

from sqlalchemy.orm import Session
from app.models.role import Role
from app.schemas.role import RoleCreate

class RoleCRUD:
    @staticmethod
    def create_role(db: Session, role_data: RoleCreate):
        role = Role(name=role_data.name)
        db.add(role)
        db.commit()
        db.refresh(role)
        return role

    @staticmethod
    def get_all_roles(db: Session):
        return db.query(Role).all()

    @staticmethod
    def get_role_by_name(db: Session, name: str):
        return db.query(Role).filter(Role.name == name).first()