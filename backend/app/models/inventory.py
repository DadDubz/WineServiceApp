from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.db import Base  # ✅ must match where Base is defined


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

    quantity = Column(Integer, default=0)
    unit = Column(String, nullable=True)
    cost_per_unit = Column(Float, nullable=True)
    category = Column(String, nullable=True)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    # ✅ by-the-glass flag
    is_btg = Column(Boolean, nullable=False, default=False)

    company = relationship("Company", back_populates="inventory_items")
