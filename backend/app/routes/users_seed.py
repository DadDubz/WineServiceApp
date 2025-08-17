# backend/app/routes/user_seed.py

from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User
from app.auth import get_password_hash

def seed_user():
    db: Session = next(get_db())

    username = "admin"
    password = "password"
    email = "admin@example.com"
    role = "admin"

    existing = db.query(User).filter(User.username == username).first()
    if existing:
        print("User already exists!")
        return

    user = User(
        username=username,
        email=email,
        hashed_password=get_password_hash(password),
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"Created user: {username}/{password}")

if __name__ == "__main__":
    seed_user()
