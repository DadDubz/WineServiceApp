from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal, Base, engine
from app.models import User, Wine
import pytest

client = TestClient(app)

# Setup the test database (runs once)
@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    db.add(Wine(name="Test Wine", vintage=2020, varietal="Cabernet", region="Napa", price=25.0, stock=10))
    db.commit()
    db.close()

def test_get_inventory():
    response = client.get("/inventory/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == "Test Wine"

def test_adjust_stock():
    # Reduce stock
    response = client.put("/inventory/adjust", json={"wine_id": 1, "quantity": -2})
    assert response.status_code == 200
    assert response.json()["stock"] == 8
