# backend/app/crud/service.py
import json
from datetime import date, datetime
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError

from app.models.service import (
    ServiceTable,
    ServiceGuest,
    ServiceTableWine,
    ServiceStepEvent,
    TableStatus,
    StepEventType,
)


class TableUseConflictError(Exception):
    """Raised when (company_id, service_date, table_number, turn) violates unique constraint."""


class InvalidTurnError(Exception):
    """Raised when turn is not 1 or 2."""


def touch(table: ServiceTable):
    table.updated_at = datetime.utcnow()


def create_table(
    db: Session,
    company_id: int,
    table_number: str,
    turn: int,
    location: Optional[str],
    guest_count: int,
    notes: Optional[str],
):
    # ✅ Best option for testing: always 1-day service = "today"
    service_date = date.today()

    # ✅ enforce reuse max twice
    if turn not in (1, 2):
        raise InvalidTurnError("turn must be 1 or 2")

    t = ServiceTable(
        company_id=company_id,
        service_date=service_date,
        table_number=table_number,
        turn=turn,
        location=location,
        guest_count=guest_count,
        notes=notes,
    )

    db.add(t)
    try:
        db.flush()
    except IntegrityError as e:
        db.rollback()
        raise TableUseConflictError(
            f"Table {table_number} turn {turn} already exists for {service_date}."
        ) from e

    touch(t)
    db.add(
        ServiceStepEvent(
            table_id=t.id,
            event_type=StepEventType.UPDATE,
            payload=json.dumps({"created": True, "service_date": service_date.isoformat()}),
        )
    )
    db.commit()
    db.refresh(t)
    return t


def get_table(db: Session, table_id: str, company_id: Optional[int] = None) -> Optional[ServiceTable]:
    q = db.query(ServiceTable).filter(ServiceTable.id == table_id)
    if company_id is not None:
        q = q.filter(ServiceTable.company_id == company_id)
    return q.first()


def list_tables(
    db: Session,
    company_id: Optional[int],
    status: TableStatus,
    page: int,
    limit: int,
    updated_since: Optional[datetime],
):
    q = db.query(ServiceTable).filter(ServiceTable.status == status)
    if company_id is not None:
        q = q.filter(ServiceTable.company_id == company_id)
    if updated_since:
        q = q.filter(ServiceTable.updated_at >= updated_since)

    total = q.count()
    items = (
        q.order_by(desc(ServiceTable.updated_at))
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return total, items


def patch_table(db: Session, table: ServiceTable, data: dict, actor_user_id: Optional[int]):
    for k, v in data.items():
        setattr(table, k, v)

    touch(table)
    db.add(
        ServiceStepEvent(
            table_id=table.id,
            event_type=StepEventType.UPDATE,
            payload=json.dumps({"fields": list(data.keys())}),
            actor_user_id=actor_user_id,
        )
    )

    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise TableUseConflictError(
            "That table_number/turn/service_date is already used for this company."
        ) from e

    db.refresh(table)
    return table


def mark_arrived(db: Session, table: ServiceTable, actor_user_id: Optional[int]):
    if not table.arrived_at:
        table.arrived_at = datetime.utcnow()
    touch(table)
    db.add(ServiceStepEvent(table_id=table.id, event_type=StepEventType.ARRIVE, actor_user_id=actor_user_id))
    db.commit()
    db.refresh(table)
    return table


def mark_seated(db: Session, table: ServiceTable, actor_user_id: Optional[int]):
    if not table.seated_at:
        table.seated_at = datetime.utcnow()
    touch(table)
    db.add(ServiceStepEvent(table_id=table.id, event_type=StepEventType.SEAT, actor_user_id=actor_user_id))
    db.commit()
    db.refresh(table)
    return table


def complete_table(db: Session, table: ServiceTable, actor_user_id: Optional[int]):
    table.status = TableStatus.COMPLETED
    if not table.completed_at:
        table.completed_at = datetime.utcnow()
    touch(table)
    db.add(ServiceStepEvent(table_id=table.id, event_type=StepEventType.COMPLETE, actor_user_id=actor_user_id))
    db.commit()
    db.refresh(table)
    return table


def next_step(db: Session, table: ServiceTable, actor_user_id: Optional[int]):
    from_step = table.step_index
    table.step_index = from_step + 1
    touch(table)
    db.add(
        ServiceStepEvent(
            table_id=table.id,
            event_type=StepEventType.NEXT,
            from_step=from_step,
            to_step=table.step_index,
            actor_user_id=actor_user_id,
        )
    )
    db.commit()
    db.refresh(table)
    return table


def undo_step(db: Session, table: ServiceTable, actor_user_id: Optional[int]):
    last = (
        db.query(ServiceStepEvent)
        .filter(ServiceStepEvent.table_id == table.id)
        .filter(ServiceStepEvent.event_type.in_([StepEventType.NEXT, StepEventType.UNDO]))
        .order_by(desc(ServiceStepEvent.created_at))
        .first()
    )
    if not last:
        return table

    if last.event_type == StepEventType.NEXT:
        target = last.from_step if last.from_step is not None else max(table.step_index - 1, 0)
    else:
        target = last.to_step if last.to_step is not None else max(table.step_index - 1, 0)

    from_step = table.step_index
    table.step_index = max(int(target), 0)
    touch(table)

    db.add(
        ServiceStepEvent(
            table_id=table.id,
            event_type=StepEventType.UNDO,
            from_step=from_step,
            to_step=table.step_index,
            actor_user_id=actor_user_id,
            payload=json.dumps({"undid_event_id": last.id}),
        )
    )
    db.commit()
    db.refresh(table)
    return table


def ensure_wines_unlocked(table: ServiceTable) -> bool:
    return table.arrived_at is not None


def add_guest(db: Session, table: ServiceTable, guest_data: dict, actor_user_id: Optional[int]):
    g = ServiceGuest(table_id=table.id, **guest_data)
    db.add(g)
    db.flush()
    touch(table)

    db.add(
        ServiceStepEvent(
            table_id=table.id,
            event_type=StepEventType.GUEST_ADD,
            actor_user_id=actor_user_id,
            payload=json.dumps({"guest_id": g.id}),
        )
    )
    db.commit()
    db.refresh(table)
    return table


def update_guest(db: Session, table: ServiceTable, guest: ServiceGuest, guest_data: dict, actor_user_id: Optional[int]):
    for k, v in guest_data.items():
        setattr(guest, k, v)
    guest.updated_at = datetime.utcnow()
    touch(table)

    db.add(
        ServiceStepEvent(
            table_id=table.id,
            event_type=StepEventType.GUEST_UPDATE,
            actor_user_id=actor_user_id,
            payload=json.dumps({"guest_id": guest.id, "fields": list(guest_data.keys())}),
        )
    )
    db.commit()
    db.refresh(table)
    return table


def remove_guest(db: Session, table: ServiceTable, guest: ServiceGuest, actor_user_id: Optional[int]):
    gid = guest.id
    db.delete(guest)
    touch(table)

    db.add(
        ServiceStepEvent(
            table_id=table.id,
            event_type=StepEventType.GUEST_REMOVE,
            actor_user_id=actor_user_id,
            payload=json.dumps({"guest_id": gid}),
        )
    )
    db.commit()
    db.refresh(table)
    return table


def add_wine(db: Session, table: ServiceTable, wine_data: dict, actor_user_id: Optional[int]):
    w = ServiceTableWine(table_id=table.id, **wine_data)
    db.add(w)
    db.flush()
    touch(table)

    db.add(
        ServiceStepEvent(
            table_id=table.id,
            event_type=StepEventType.WINE_ADD,
            actor_user_id=actor_user_id,
            payload=json.dumps({"wine_entry_id": w.id}),
        )
    )
    db.commit()
    db.refresh(table)
    return table


def update_wine(db: Session, table: ServiceTable, wine: ServiceTableWine, wine_data: dict, actor_user_id: Optional[int]):
    for k, v in wine_data.items():
        setattr(wine, k, v)
    wine.updated_at = datetime.utcnow()
    touch(table)

    db.add(
        ServiceStepEvent(
            table_id=table.id,
            event_type=StepEventType.UPDATE,
            actor_user_id=actor_user_id,
            payload=json.dumps({"wine_entry_id": wine.id, "fields": list(wine_data.keys())}),
        )
    )
    db.commit()
    db.refresh(table)
    return table


def remove_wine(db: Session, table: ServiceTable, wine: ServiceTableWine, actor_user_id: Optional[int]):
    payload = {
        "wine_entry": {
            "id": wine.id,
            "kind": str(wine.kind.value),
            "wine_id": wine.wine_id,
            "label": wine.label,
            "quantity": float(wine.quantity),
        }
    }
    db.delete(wine)
    touch(table)

    db.add(
        ServiceStepEvent(
            table_id=table.id,
            event_type=StepEventType.WINE_REMOVE,
            actor_user_id=actor_user_id,
            payload=json.dumps(payload),
        )
    )
    db.commit()
    db.refresh(table)
    return table
