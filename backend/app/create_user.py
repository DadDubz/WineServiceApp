# backend/create_user.py

from app.db import SessionLocal
from app.models import User
from app.auth_utils import get_password_hash

def create_user():
    db = SessionLocal()

    username = "admin"
    password = "password123"  # Replace with your own

    existing = db.query(User).filter(User.username == username).first()
    if existing:
        print(f"User '{username}' already exists.")
        return

    hashed = get_password_hash(password)

    new_user = User(
        username=username,
        password_hash=hashed,
        role="manager"  # or "sommelier", "expo", etc.
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    print(f"User '{username}' created with ID: {new_user.id}")

if __name__ == "__main__":
    create_user()
