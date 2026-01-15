from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps.auth import CurrentUser
from app.deps.roles import require_roles
from app.models.service import ServiceGuest, ServiceTableWine, TableStatus
from app.schemas.service import (
    TableCreate,
    TablePatch,
    TableDetail,
    TableListResponse,
    TableListItem,
    StepAdvanceResponse,
    GuestCreate,
    GuestPatch,
    GuestOut,
    WineEntryCreate,
    WineEntryPatch,
    WineEntryOut,
)
from app.crud import service as crud

router = APIRouter(prefix="/api/service", tags=["service"])


# --- role policy (tune as you like) ---
CAN_VIEW = ("server", "expo", "sommelier", "manager")
CAN_TABLE_EDIT = ("expo", "sommelier", "manager")
CAN_STEPS = ("expo", "sommelier", "manager")
CAN_WINES = ("sommelier", "manager")
CAN_GUESTS = ("server", "expo", "sommelier", "manager")


@router.get("/tables", response_model=TableListResponse, dependencies=[Depends(require_roles(*CAN_VIEW))])
def list_tables(
    db: Session = Depends(get_db),
    status: TableStatus = Query(TableStatus.OPEN),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    updated_since: Optional[str] = Query(None),
):
    dt = None
    if updated_since:
        try:
            dt = datetime.fromisoformat(updated_since)
        except Exception:
            raise HTTPException(status_code=400, detail="updated_since must be ISO datetime")

    total, items = crud.list_tables(db, status=status, page=page, limit=limit, updated_since=dt)
    return TableListResponse(
        items=[
            TableListItem(
                id=t.id,
                table_number=t.table_number,
                location=t.location,
                status=t.status,
                step_index=t.step_index,
                guest_count=t.guest_count,
                arrived_at=t.arrived_at,
                seated_at=t.seated_at,
                updated_at=t.updated_at,
            )
            for t in items
        ],
        page=page,
        limit=limit,
        total=total,
    )


@router.post("/tables", response_model=TableDetail, dependencies=[Depends(require_roles(*CAN_TABLE_EDIT))])
def create_table(
    payload: TableCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_roles(*CAN_TABLE_EDIT)),
):
    t = crud.create_table(db, payload.table_number, payload.location, payload.guest_count, payload.notes)
    # reload full
    t = crud.get_table(db, t.id)
    return t


@router.get("/tables/{table_id}", response_model=TableDetail, dependencies=[Depends(require_roles(*CAN_VIEW))])
def get_table_detail(table_id: str, db: Session = Depends(get_db)):
    t = crud.get_table(db, table_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")
    return t


@router.patch("/tables/{table_id}", response_model=TableDetail, dependencies=[Depends(require_roles(*CAN_TABLE_EDIT))])
def patch_table(
    table_id: str,
    payload: TablePatch,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_roles(*CAN_TABLE_EDIT)),
):
    t = crud.get_table(db, table_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")
    data = payload.dict(exclude_unset=True)
    t = crud.patch_table(db, t, data, actor_user_id=user.id)
    return t


@router.post("/tables/{table_id}/arrive", response_model=TableDetail, dependencies=[Depends(require_roles(*CAN_TABLE_EDIT))])
def arrive(table_id: str, db: Session = Depends(get_db), user: CurrentUser = Depends(require_roles(*CAN_TABLE_EDIT))):
    t = crud.get_table(db, table_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")
    return crud.mark_arrived(db, t, actor_user_id=user.id)


@router.post("/tables/{table_id}/seat", response_model=TableDetail, dependencies=[Depends(require_roles(*CAN_TABLE_EDIT))])
def seat(table_id: str, db: Session = Depends(get_db), user: CurrentUser = Depends(require_roles(*CAN_TABLE_EDIT))):
    t = crud.get_table(db, table_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")
    return crud.mark_seated(db, t, actor_user_id=user.id)


@router.post("/tables/{table_id}/complete", response_model=TableDetail, dependencies=[Depends(require_roles(*CAN_TABLE_EDIT))])
def complete(table_id: str, db: Session = Depends(get_db), user: CurrentUser = Depends(require_roles(*CAN_TABLE_EDIT))):
    t = crud.get_table(db, table_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")
    return crud.complete_table(db, t, actor_user_id=user.id)


# ---------- steps ----------
@router.post("/tables/{table_id}/next", response_model=StepAdvanceResponse, dependencies=[Depends(require_roles(*CAN_STEPS))])
def next_step(table_id: str, db: Session = Depends(get_db), user: CurrentUser = Depends(require_roles(*CAN_STEPS))):
    t = crud.get_table(db, table_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")
    t = crud.next_step(db, t, actor_user_id=user.id)
    return StepAdvanceResponse(table_id=t.id, step_index=t.step_index, updated_at=t.updated_at)


@router.post("/tables/{table_id}/undo", response_model=StepAdvanceResponse, dependencies=[Depends(require_roles(*CAN_STEPS))])
def undo_step(table_id: str, db: Session = Depends(get_db), user: CurrentUser = Depends(require_roles(*CAN_STEPS))):
    t = crud.get_table(db, table_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")
    t = crud.undo_step(db, t, actor_user_id=user.id)
    return StepAdvanceResponse(table_id=t.id, step_index=t.step_index, updated_at=t.updated_at)


# ---------- guests ----------
@router.post("/tables/{table_id}/guests", response_model=TableDetail, dependencies=[Depends(require_roles(*CAN_GUESTS))])
def add_guest(
    table_id: str,
    payload: GuestCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_roles(*CAN_GUESTS)),
):
    t = crud.get_table(db, table_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")
    _, t = crud.add_guest(db, t, payload.dict(exclude_unset=True), actor_user_id=user.id)
    return t


@router.patch("/tables/{table_id}/guests/{guest_id}", response_model=TableDetail, dependencies=[Depends(require_roles(*CAN_GUESTS))])
def patch_guest(
    table_id: str,
    guest_id: str,
    payload: GuestPatch,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_roles(*CAN_GUESTS)),
):
    t = crud.get_table(db, table_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")

    g = db.query(ServiceGuest).filter(ServiceGuest.id == guest_id, ServiceGuest.table_id == table_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Guest not found")

    _, t = crud.update_guest(db, t, g, payload.dict(exclude_unset=True), actor_user_id=user.id)
    return t


@router.delete("/tables/{table_id}/guests/{guest_id}", response_model=TableDetail, dependencies=[Depends(require_roles(*CAN_GUESTS))])
def delete_guest(
    table_id: str,
    guest_id: str,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_roles(*CAN_GUESTS)),
):
    t = crud.get_table(db, table_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")

    g = db.query(ServiceGuest).filter(ServiceGuest.id == guest_id, ServiceGuest.table_id == table_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Guest not found")

    t = crud.remove_guest(db, t, g, actor_user_id=user.id)
    return t


# ---------- wines (locked until arrived) ----------
@router.post("/tables/{table_id}/wines", response_model=TableDetail, dependencies=[Depends(require_roles(*CAN_WINES))])
def add_wine(
    table_id: str,
    payload: WineEntryCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_roles(*CAN_WINES)),
):
    t = crud.get_table(db, table_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")

    if not crud.ensure_wines_unlocked(t):
        raise HTTPException(status_code=409, detail="Wines are locked until arrival")

    _, t = crud.add_wine(db, t, payload.dict(exclude_unset=True), actor_user_id=user.id)
    return t


@router.patch("/tables/{table_id}/wines/{wine_entry_id}", response_model=TableDetail, dependencies=[Depends(require_roles(*CAN_WINES))])
def patch_wine(
    table_id: str,
    wine_entry_id: str,
    payload: WineEntryPatch,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_roles(*CAN_WINES)),
):
    t = crud.get_table(db, table_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")

    if not crud.ensure_wines_unlocked(t):
        raise HTTPException(status_code=409, detail="Wines are locked until arrival")

    w = db.query(ServiceTableWine).filter(ServiceTableWine.id == wine_entry_id, ServiceTableWine.table_id == table_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Wine entry not found")

    _, t = crud.update_wine(db, t, w, payload.dict(exclude_unset=True), actor_user_id=user.id)
    return t


@router.delete("/tables/{table_id}/wines/{wine_entry_id}", response_model=TableDetail, dependencies=[Depends(require_roles(*CAN_WINES))])
def delete_wine(
    table_id: str,
    wine_entry_id: str,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_roles(*CAN_WINES)),
):
    t = crud.get_table(db, table_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")

    if not crud.ensure_wines_unlocked(t):
        raise HTTPException(status_code=409, detail="Wines are locked until arrival")

    w = db.query(ServiceTableWine).filter(ServiceTableWine.id == wine_entry_id, ServiceTableWine.table_id == table_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Wine entry not found")

    t = crud.remove_wine(db, t, w, actor_user_id=user.id)
    return t
