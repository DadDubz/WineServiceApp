#!/usr/bin/env python3
"""Initialize the database with tables and seed data."""

from app.db import engine, SessionLocal
from app.models.base import Base
from app.models.user import User
from app.models.wine import Wine
from app.models.table import Table
from app.models.company import Company
from app.models.inventory import InventoryItem
from app.models.service_log import ServiceLog
from app.models.guest import Guest
from app.models.order import Order
from app.auth import get_password_hash

def init_database():
    """Create all tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")

def seed_users():
    """Create demo users for the wine service."""
    db = SessionLocal()
    try:
        # Check if users already exist
        existing = db.query(User).first()
        if existing:
            print("✓ Users already seeded")
            return

        demo_users = [
            {
                "username": "manager1",
                "email": "manager@wineservice.com",
                "password": "pass",
                "role": "manager"
            },
            {
                "username": "sommelier1",
                "email": "sommelier@wineservice.com",
                "password": "pass",
                "role": "sommelier"
            },
            {
                "username": "expo1",
                "email": "expo@wineservice.com",
                "password": "pass",
                "role": "expo"
            },
            {
                "username": "server1",
                "email": "server@wineservice.com",
                "password": "pass",
                "role": "server"
            }
        ]

        for user_data in demo_users:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"]
            )
            db.add(user)
            print(f"✓ Created user: {user_data['username']} / {user_data['password']} ({user_data['role']})")

        db.commit()
        print("✓ All users seeded successfully")

    except Exception as e:
        print(f"✗ Error seeding users: {e}")
        db.rollback()
    finally:
        db.close()

def seed_wines():
    """Create demo wine inventory."""
    db = SessionLocal()
    try:
        # Check if wines already exist
        existing = db.query(Wine).first()
        if existing:
            print("✓ Wines already seeded")
            return

        demo_wines = [
            {
                "name": "Chardonnay",
                "vintage": "2019",
                "varietal": "Chardonnay",
                "region": "Sonoma, CA",
                "notes": "Crisp and refreshing with notes of apple and citrus. Produced by Sonoma Vineyards."
            },
            {
                "name": "Pinot Noir",
                "vintage": "2018",
                "varietal": "Pinot Noir",
                "region": "Willamette Valley, OR",
                "notes": "Elegant red with cherry and earthy notes. From Willamette Valley Vineyards."
            },
            {
                "name": "Cabernet Sauvignon",
                "vintage": "2017",
                "varietal": "Cabernet Sauvignon",
                "region": "Napa Valley, CA",
                "notes": "Full-bodied with dark fruit and oak. Premium selection from Napa Cellars."
            }
        ]

        for wine_data in demo_wines:
            wine = Wine(**wine_data)
            db.add(wine)
            print(f"✓ Added wine: {wine_data['name']} ({wine_data['vintage']})")

        db.commit()
        print("✓ All wines seeded successfully")

    except Exception as e:
        print(f"✗ Error seeding wines: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 50)
    print("Wine Service Database Initialization")
    print("=" * 50)
    
    init_database()
    seed_users()
    seed_wines()
    
    print("=" * 50)
    print("✓ Database initialization complete!")
    print("=" * 50)
    print("\nDemo Login Credentials:")
    print("  manager1 / pass (Manager role)")
    print("  sommelier1 / pass (Sommelier role)")
    print("  expo1 / pass (Expo role)")
    print("  server1 / pass (Server role)")
