# app/services/inventory.py (or wherever your InventoryService lives)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.models.inventory import InventoryItem
from app.schemas.inventory import InventoryCreate, InventoryUpdate

class InventoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_items(self, company_id: int):
        result = await self.db.execute(
            select(InventoryItem).where(InventoryItem.company_id == company_id)
        )
        return result.scalars().all()

    async def get_item_by_id(self, item_id: int, company_id: int):
        result = await self.db.execute(
            select(InventoryItem).where(
                InventoryItem.id == item_id,
                InventoryItem.company_id == company_id
            )
        )
        item = result.scalar_one_or_none()
        if item is None:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        return item

    async def create_item(self, item: InventoryCreate, company_id: int):
        new_item = InventoryItem(**item.model_dump(), company_id=company_id)
        self.db.add(new_item)
        await self.db.commit()
        await self.db.refresh(new_item)
        return new_item

    async def update_item(self, item_id: int, item_update: InventoryUpdate, company_id: int):
        item = await self.get_item_by_id(item_id, company_id)
        for field, value in item_update.model_dump(exclude_unset=True).items():
            setattr(item, field, value)
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def delete_item(self, item_id: int, company_id: int):
        item = await self.get_item_by_id(item_id, company_id)
        await self.db.delete(item)
        await self.db.commit()
        return {"detail": "Item deleted successfully"}
