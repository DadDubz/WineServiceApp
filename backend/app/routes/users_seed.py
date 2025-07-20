from app.db import Base, engine, SessionLocal
from app.models import User
from app.auth import hash_password

def seed_users():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    users = [
        {"username": "expo1", "password": "pass", "role": "expo"},
        {"username": "sommelier1", "password": "pass", "role": "sommelier"},
        {"username": "manager1", "password": "pass", "role": "manager"},
    ]
    for u in users:
        if not db.query(User).filter_by(username=u["username"]).first():
            user = User(username=u["username"], password_hash=hash_password(u["password"]), role=u["role"])
            db.add(user)
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_users()
