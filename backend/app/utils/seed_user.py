# app/utils/seed_user.py

from app.db import SessionLocal
from app.models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()

def create_test_user():
    username = "adman"
    password = "admin123!"
    role = "manager"

    hashed_password = pwd_context.hash(password)

    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        print("User already exists.")
        return

    user = User(username=username, password_hash=hashed_password, role=role)
    db.add(user)
    db.commit()
    print(f"✅ Created user: {username} / {password}")

if __name__ == "__main__":
    create_test_user()
