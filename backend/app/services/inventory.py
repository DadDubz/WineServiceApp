from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import NoResultFound
from models.inventory import InventoryItem
from ..schemas.inventory import InventoryCreate, InventoryUpdate
from fastapi import HTTPException, status


class InventoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_items(self):
        result = await self.db.execute(select(InventoryItem))
        return result.scalars().all()

    async def get_item_by_id(self, item_id: int):
        result = await self.db.execute(select(InventoryItem).where(InventoryItem.id == item_id))
        item = result.scalar_one_or_none()
        if item is None:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        return item

    async def create_item(self, item: InventoryCreate):
        new_item = InventoryItem(**item.dict())
        self.db.add(new_item)
        await self.db.commit()
        await self.db.refresh(new_item)
        return new_item

    async def update_item(self, item_id: int, item_update: InventoryUpdate):
        item = await self.get_item_by_id(item_id)
        for field, value in item_update.dict(exclude_unset=True).items():
            setattr(item, field, value)
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def delete_item(self, item_id: int):
        item = await self.get_item_by_id(item_id)
        await self.db.delete(item)
        await self.db.commit()
        return {"detail": "Item deleted successfully"}
