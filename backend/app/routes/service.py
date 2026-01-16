# backend/app/routes/service.py
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.routes.auth import get_current_user, require_role
from app.models.user import User
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
    WineEntryCreate,
    WineEntryPatch,
)
from app.crud import service as crud

router = APIRouter(tags=["Service"])

# Role policy (tune)
CAN_VIEW = ("server", "expo", "sommelier", "manager")
CAN_TABLE_EDIT = ("expo", "sommelier", "manager")
CAN_STEPS = ("expo", "sommelier", "manager")
CAN_WINES = ("sommelier", "manager")
CAN_GUESTS = ("server", "expo", "sommelier", "manager")


def parse_iso_dt(updated_since: Optional[str]) -> Optional[datetime]:
    if not updated_since:
        return None
    try:
        return datetime.fromisoformat(updated_since)
    except Exception:
        raise HTTPException(status_code=400, detail="updated_since must be ISO datetime")


def validate_turn(turn: Optional[int]) -> int:
    """
    Supports "reuse table twice max" via turn=1 or 2.
    If not provided -> defaults to 1.
    """
    t = int(turn or 1)
    if t not in (1, 2):
        raise HTTPException(status_code=400, detail="turn must be 1 or 2")
    return t


@router.get(
    "/service/tables",
    response_model=TableListResponse,
    dependencies=[Depends(require_role(*CAN_VIEW))],
)
def list_tables(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: TableStatus = Query(TableStatus.OPEN),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    updated_since: Optional[str] = Query(None),
):
    dt = parse_iso_dt(updated_since)
    total, items = crud.list_tables(
        db,
        company_id=current_user.company_id,
        status=status,
        page=page,
        limit=limit,
        updated_since=dt,
    )
    return TableListResponse(
        items=[TableListItem.model_validate(t) for t in items],
        page=page,
        limit=limit,
        total=total,
    )


@router.post(
    "/service/tables",
    response_model=TableDetail,
    dependencies=[Depends(require_role(*CAN_TABLE_EDIT))],
)
def create_table(
    payload: TableCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ✅ NEW: validate turn
    turn = validate_turn(getattr(payload, "turn", None))

    # Your CRUD can accept "turn" now.
    # If you haven't added it yet, update crud.create_table signature to include turn.
    t = crud.create_table(
        db,
        company_id=current_user.company_id,
        table_number=payload.table_number,
        location=payload.location,
        guest_count=payload.guest_count,
        notes=payload.notes,
        turn=turn,  # ✅
    )
    t = crud.get_table(db, t.id, company_id=current_user.company_id)
    return t


@router.get(
    "/service/tables/{table_id}",
    response_model=TableDetail,
    dependencies=[Depends(require_role(*CAN_VIEW))],
)
def get_table_detail(
    table_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = crud.get_table(db, table_id, company_id=current_user.company_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")
    return t


@router.patch(
    "/service/tables/{table_id}",
    response_model=TableDetail,
    dependencies=[Depends(require_role(*CAN_TABLE_EDIT))],
)
def patch_table(
    table_id: str,
    payload: TablePatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = crud.get_table(db, table_id, company_id=current_user.company_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")
    data = payload.model_dump(exclude_unset=True)

    # ✅ protect turn changes if you want:
    if "turn" in data:
        data["turn"] = validate_turn(data["turn"])

    return crud.patch_table(db, t, data, actor_user_id=current_user.id)


@router.post(
    "/service/tables/{table_id}/arrive",
    response_model=TableDetail,
    dependencies=[Depends(require_role(*CAN_TABLE_EDIT))],
)
def arrive(
    table_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = crud.get_table(db, table_id, company_id=current_user.company_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")
    return crud.mark_arrived(db, t, actor_user_id=current_user.id)


@router.post(
    "/service/tables/{table_id}/seat",
    response_model=TableDetail,
    dependencies=[Depends(require_role(*CAN_TABLE_EDIT))],
)
def seat(
    table_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = crud.get_table(db, table_id, company_id=current_user.company_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")
    return crud.mark_seated(db, t, actor_user_id=current_user.id)


@router.post(
    "/service/tables/{table_id}/complete",
    response_model=TableDetail,
    dependencies=[Depends(require_role(*CAN_TABLE_EDIT))],
)
def complete(
    table_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = crud.get_table(db, table_id, company_id=current_user.company_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")
    return crud.complete_table(db, t, actor_user_id=current_user.id)


@router.post(
    "/service/tables/{table_id}/next",
    response_model=StepAdvanceResponse,
    dependencies=[Depends(require_role(*CAN_STEPS))],
)
def next_step(
    table_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = crud.get_table(db, table_id, company_id=current_user.company_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")
    t = crud.next_step(db, t, actor_user_id=current_user.id)
    return StepAdvanceResponse(table_id=t.id, step_index=t.step_index, updated_at=t.updated_at)


@router.post(
    "/service/tables/{table_id}/undo",
    response_model=StepAdvanceResponse,
    dependencies=[Depends(require_role(*CAN_STEPS))],
)
def undo_step(
    table_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = crud.get_table(db, table_id, company_id=current_user.company_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")
    t = crud.undo_step(db, t, actor_user_id=current_user.id)
    return StepAdvanceResponse(table_id=t.id, step_index=t.step_index, updated_at=t.updated_at)


@router.post(
    "/service/tables/{table_id}/guests",
    response_model=TableDetail,
    dependencies=[Depends(require_role(*CAN_GUESTS))],
)
def add_guest(
    table_id: str,
    payload: GuestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = crud.get_table(db, table_id, company_id=current_user.company_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")
    return crud.add_guest(db, t, payload.model_dump(exclude_unset=True), actor_user_id=current_user.id)


@router.patch(
    "/service/tables/{table_id}/guests/{guest_id}",
    response_model=TableDetail,
    dependencies=[Depends(require_role(*CAN_GUESTS))],
)
def patch_guest(
    table_id: str,
    guest_id: str,
    payload: GuestPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = crud.get_table(db, table_id, company_id=current_user.company_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")

    g = (
        db.query(ServiceGuest)
        .filter(ServiceGuest.id == guest_id, ServiceGuest.table_id == table_id)
        .first()
    )
    if not g:
        raise HTTPException(status_code=404, detail="Guest not found")

    return crud.update_guest(db, t, g, payload.model_dump(exclude_unset=True), actor_user_id=current_user.id)


@router.delete(
    "/service/tables/{table_id}/guests/{guest_id}",
    response_model=TableDetail,
    dependencies=[Depends(require_role(*CAN_GUESTS))],
)
def delete_guest(
    table_id: str,
    guest_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = crud.get_table(db, table_id, company_id=current_user.company_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")

    g = (
        db.query(ServiceGuest)
        .filter(ServiceGuest.id == guest_id, ServiceGuest.table_id == table_id)
        .first()
    )
    if not g:
        raise HTTPException(status_code=404, detail="Guest not found")

    return crud.remove_guest(db, t, g, actor_user_id=current_user.id)


@router.post(
    "/service/tables/{table_id}/wines",
    response_model=TableDetail,
    dependencies=[Depends(require_role(*CAN_WINES))],
)
def add_wine(
    table_id: str,
    payload: WineEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = crud.get_table(db, table_id, company_id=current_user.company_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")

    if not crud.ensure_wines_unlocked(t):
        raise HTTPException(status_code=409, detail="Wines are locked until arrival")

    return crud.add_wine(db, t, payload.model_dump(exclude_unset=True), actor_user_id=current_user.id)


@router.patch(
    "/service/tables/{table_id}/wines/{wine_entry_id}",
    response_model=TableDetail,
    dependencies=[Depends(require_role(*CAN_WINES))],
)
def patch_wine(
    table_id: str,
    wine_entry_id: str,
    payload: WineEntryPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = crud.get_table(db, table_id, company_id=current_user.company_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")

    if not crud.ensure_wines_unlocked(t):
        raise HTTPException(status_code=409, detail="Wines are locked until arrival")

    w = (
        db.query(ServiceTableWine)
        .filter(ServiceTableWine.id == wine_entry_id, ServiceTableWine.table_id == table_id)
        .first()
    )
    if not w:
        raise HTTPException(status_code=404, detail="Wine entry not found")

    return crud.update_wine(db, t, w, payload.model_dump(exclude_unset=True), actor_user_id=current_user.id)


@router.delete(
    "/service/tables/{table_id}/wines/{wine_entry_id}",
    response_model=TableDetail,
    dependencies=[Depends(require_role(*CAN_WINES))],
)
def delete_wine(
    table_id: str,
    wine_entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = crud.get_table(db, table_id, company_id=current_user.company_id)
    if not t:
        raise HTTPException(status_code=404, detail="Table not found")

    if not crud.ensure_wines_unlocked(t):
        raise HTTPException(status_code=409, detail="Wines are locked until arrival")

    w = (
        db.query(ServiceTableWine)
        .filter(ServiceTableWine.id == wine_entry_id, ServiceTableWine.table_id == table_id)
        .first()
    )
    if not w:
        raise HTTPException(status_code=404, detail="Wine entry not found")

    return crud.remove_wine(db, t, w, actor_user_id=current_user.id)
