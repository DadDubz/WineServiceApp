# backend/app/models.py
# Backwards compatibility shim for older imports
from app.models.base import Base
from app.models.user import User
from app.models.wine import Wine
from app.models.table import Table
from app.models.service_log import ServiceLog
from app.models.inventory import InventoryItem