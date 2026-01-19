# backend/scripts/seed_dev.py
from __future__ import annotations

from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models.company import Company
from app.models.user import User, UserRole
from app.core.security import get_password_hash


def main():
    db: Session = SessionLocal()
    try:
        # 1) Company
        company = db.query(Company).filter(Company.name == "Dev Restaurant").first()
        if not company:
            company = Company(name="Dev Restaurant")
            db.add(company)
            db.commit()
            db.refresh(company)

        # 2) Users
        def upsert_user(email: str, username: str, role: UserRole, password: str):
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(
                    email=email,
                    username=username,
                    role=role,
                    company_id=company.id,
                    hashed_password=get_password_hash(password),
                )
                db.add(u)
                db.commit()
                db.refresh(u)
            else:
                # keep existing password unless blank
                u.username = username
                u.role = role
                u.company_id = company.id
                if password:
                    u.hashed_password = get_password_hash(password)
                db.commit()
                db.refresh(u)
            return u

        # Passwords for dev testing (change later)
        manager = upsert_user(
            email="manager@dev.local",
            username="manager",
            role=UserRole.manager,
            password="password123",
        )
        sommelier = upsert_user(
            email="sommelier@dev.local",
            username="sommelier",
            role=UserRole.sommelier,
            password="password123",
        )
        expo = upsert_user(
            email="expo@dev.local",
            username="expo",
            role=UserRole.expo,
            password="password123",
        )
        server = upsert_user(
            email="server@dev.local",
            username="server",
            role=UserRole.server,
            password="password123",
        )

        print("✅ Seed complete")
        print(f"Company: {company.id} - {company.name}")
        print("Users:")
        print(f" - manager:   {manager.email} / password123")
        print(f" - sommelier: {sommelier.email} / password123")
        print(f" - expo:      {expo.email} / password123")
        print(f" - server:    {server.email} / password123")

    finally:
        db.close()


if __name__ == "__main__":
    main()
