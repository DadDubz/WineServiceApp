from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.auth import get_password_hash


def seed_user() -> None:
    db: Session = next(get_db())

    username = "admin"
    password = "password"
    email = "admin@example.com"
    role = "admin"
    company_id = 1

    existing = db.query(User).filter(User.username == username).first()
    if existing:
        print("User already exists!")
        return

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

    print(f"Created user: {username}/{password} (company_id={company_id})")


if __name__ == "__main__":
    seed_user()
