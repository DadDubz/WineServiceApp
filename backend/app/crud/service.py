# backend/app/crud/service.py
import json
from datetime import datetime, date
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


def utcnow() -> datetime:
    return datetime.utcnow()


def today() -> date:
    # For now: simple UTC date. If you want local restaurant time later,
    # we can switch to America/Chicago using zoneinfo.
    return date.today()


def touch(table: ServiceTable):
    table.updated_at = utcnow()


def create_table(
    db: Session,
    company_id: int | None,
    table_number: str,
    location: str | None,
    guest_count: int,
    notes: str | None,
    turn: int = 1,
    service_date: Optional[date] = None,
):
    """
    Creates ONE 'use' of a physical table for a given service date.
    A physical table can be reused at most twice (turn=1 or 2).
    """
    if turn not in (1, 2):
        raise ValueError("turn must be 1 or 2")

    sd = service_date or today()

    t = ServiceTable(
        company_id=company_id,
        service_date=sd,
        table_number=table_number,
        turn=turn,
        location=location,
        guest_count=guest_count,
        notes=notes,
        status=TableStatus.OPEN,
    )
    db.add(t)
    db.flush()
    touch(t)

    db.add(
        ServiceStepEvent(
            table_id=t.id,
            event_type=StepEventType.UPDATE,
            payload=json.dumps({"created": True, "service_date": sd.isoformat(), "turn": turn}),
        )
    )

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # Uniqueness constraint: company_id, service_date, table_number, turn
        raise ValueError("That table number + turn is already in use for this service date.")

    db.refresh(t)
    return t


def get_table(db: Session, table_id: str, company_id: int | None = None) -> ServiceTable | None:
    q = db.query(ServiceTable).filter(ServiceTable.id == table_id)
    if company_id is not None:
        q = q.filter(ServiceTable.company_id == company_id)
    return q.first()


def list_tables(
    db: Session,
    company_id: int | None,
    status: TableStatus,
    page: int,
    limit: int,
    updated_since: datetime | None,
    service_date: Optional[date] = None,
):
    """
    Lists tables for the current service day by default.
    Minimal payload should be handled by schema/response model, not here.
    """
    sd = service_date or today()

    q = db.query(ServiceTable).filter(ServiceTable.status == status)

    if company_id is not None:
        q = q.filter(ServiceTable.company_id == company_id)

    q = q.filter(ServiceTable.service_date == sd)

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


def patch_table(db: Session, table: ServiceTable, data: dict, actor_user_id: int | None):
    # Prevent changing service_date/table_number/turn unless you explicitly want it
    protected = {"service_date", "table_number", "turn", "company_id", "id"}
    for k, v in data.items():
        if k in protected:
            continue
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
    db.commit()
    db.refresh(table)
    return table


def mark_arrived(db: Session, table: ServiceTable, actor_user_id: int | None):
    if not table.arrived_at:
        table.arrived_at = utcnow()
    touch(table)
    db.add(ServiceStepEvent(table_id=table.id, event_type=StepEventType.ARRIVE, actor_user_id=actor_user_id))
    db.commit()
    db.refresh(table)
    return table


def mark_seated(db: Session, table: ServiceTable, actor_user_id: int | None):
    if not table.seated_at:
        table.seated_at = utcnow()
    touch(table)
    db.add(ServiceStepEvent(table_id=table.id, event_type=StepEventType.SEAT, actor_user_id=actor_user_id))
    db.commit()
    db.refresh(table)
    return table


def complete_table(db: Session, table: ServiceTable, actor_user_id: int | None):
    table.status = TableStatus.COMPLETED
    if not table.completed_at:
        table.completed_at = utcnow()
    touch(table)
    db.add(ServiceStepEvent(table_id=table.id, event_type=StepEventType.COMPLETE, actor_user_id=actor_user_id))
    db.commit()
    db.refresh(table)
    return table


def next_step(db: Session, table: ServiceTable, actor_user_id: int | None):
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


def undo_step(db: Session, table: ServiceTable, actor_user_id: int | None):
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


def add_guest(db: Session, table: ServiceTable, guest_data: dict, actor_user_id: int | None):
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


def update_guest(db: Session, table: ServiceTable, guest: ServiceGuest, guest_data: dict, actor_user_id: int | None):
    for k, v in guest_data.items():
        setattr(guest, k, v)
    guest.updated_at = utcnow()
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


def remove_guest(db: Session, table: ServiceTable, guest: ServiceGuest, actor_user_id: int | None):
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


def add_wine(db: Session, table: ServiceTable, wine_data: dict, actor_user_id: int | None):
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


def update_wine(db: Session, table: ServiceTable, wine: ServiceTableWine, wine_data: dict, actor_user_id: int | None):
    for k, v in wine_data.items():
        setattr(wine, k, v)
    wine.updated_at = utcnow()
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


def remove_wine(db: Session, table: ServiceTable, wine: ServiceTableWine, actor_user_id: int | None):
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
