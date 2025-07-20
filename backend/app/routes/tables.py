from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from app import models, schemas
from app.auth import get_current_user
from app.db import SessionLocal

router = APIRouter(prefix="/tables", tags=["Tables"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.TableOut])
def get_tables(db: Session = Depends(get_db)):
    tables = db.query(models.Table).all()
    return [convert_table(t) for t in tables]

@router.post("/", response_model=schemas.TableOut)
def seat_table(table: schemas.TableCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    new_table = models.Table(
        number=table.number,
        server=table.server,
        guests=table.guests,
        status=table.status,
        courses_json="[]"
    )
    db.add(new_table)
    db.commit()
    db.refresh(new_table)
    return convert_table(new_table)

@router.post("/{table_id}/courses", response_model=schemas.Course)
def add_course(table_id: int, course: schemas.Course, db: Session = Depends(get_db), user=Depends(get_current_user)):
    table = db.query(models.Table).filter_by(id=table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")

    courses = json.loads(table.courses_json)
    courses.append(course.dict())
    table.courses_json = json.dumps(courses)

    db.commit()
    return course

def convert_table(table: models.Table):
    courses = json.loads(table.courses_json or "[]")
    return {
        "id": table.id,
        "number": table.number,
        "server": table.server,
        "guests": table.guests,
        "status": table.status,
        "courses": courses,
    }
