# backend/scripts/seed_dev.py
from __future__ import annotations

"""
Dev seed script.

IMPORTANT:
- Run from backend/ like:
    py -m scripts.seed_dev
- This file intentionally imports models to ensure SQLAlchemy mapper registry is populated.
"""

import os
from datetime import date
from sqlalchemy.orm import Session

# ---- Ensure "backend/" is on sys.path when executed in weird contexts ----
# (Usually unnecessary when running `py -m ...` from backend/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(BASE_DIR)

from app.db import SessionLocal  # noqa: E402

# ---- Import ALL models so relationship("...") strings resolve ----
# (This prevents: "failed to locate a name ('ServiceTable')")
import app.models.user  # noqa: F401,E402
import app.models.company  # noqa: F401,E402
import app.models.inventory  # noqa: F401,E402
import app.models.wine  # noqa: F401,E402  # keep if you have it
import app.models.service  # noqa: F401,E402

from app.core.security import get_password_hash  # noqa: E402
from app.models.company import Company  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.service import ServiceTable, TableStatus  # noqa: E402


def upsert_company(db: Session, name: str) -> Company:
    company = db.query(Company).filter(Company.name == name).first()
    if company:
        return company
    company = Company(name=name)
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def upsert_user(
    db: Session,
    *,
    username: str,
    email: str,
    password: str,
    role: str,
    company_id: int,
) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        # keep existing user but ensure role/company is correct
        user.username = username
        user.role = role
        user.company_id = company_id
        if password:
            user.hashed_password = get_password_hash(password)
        db.commit()
        db.refresh(user)
        return user

    user = User(
        username=username,
        email=email,
        hashed_password=get_password_hash(password),
        role=role,
        company_id=company_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def seed_service_tables(db: Session, company_id: int) -> None:
    today = date.today()

    existing = (
        db.query(ServiceTable)
        .filter(ServiceTable.company_id == company_id)
        .filter(ServiceTable.service_date == today)
        .count()
    )
    if existing > 0:
        print(f"Service tables already exist for {today}, skipping table seed.")
        return

    # Basic set for testing (adjust however you want)
    for n in range(1, 11):
        t = ServiceTable(
            company_id=company_id,
            service_date=today,
            table_number=str(n),
            turn=1,
            status=TableStatus.OPEN,
            guest_count=0,
            step_index=0,
        )
        db.add(t)

    db.commit()
    print(f"Seeded 10 service tables for {today}.")


def main():
    db = SessionLocal()
    try:
        company = upsert_company(db, "Dev Restaurant")

        # Create a few users with different roles
        upsert_user(
            db,
            username="manager",
            email="manager@dev.local",
            password="password123",
            role="manager",
            company_id=company.id,
        )
        upsert_user(
            db,
            username="sommelier",
            email="sommelier@dev.local",
            password="password123",
            role="sommelier",
            company_id=company.id,
        )
        upsert_user(
            db,
            username="expo",
            email="expo@dev.local",
            password="password123",
            role="expo",
            company_id=company.id,
        )
        upsert_user(
            db,
            username="server",
            email="server@dev.local",
            password="password123",
            role="server",
            company_id=company.id,
        )

        seed_service_tables(db, company.id)

        print("✅ Seed complete.")
        print("Logins:")
        print("  manager@dev.local / password123")
        print("  sommelier@dev.local / password123")
        print("  expo@dev.local / password123")
        print("  server@dev.local / password123")
    finally:
        db.close()


if __name__ == "__main__":
    main()
