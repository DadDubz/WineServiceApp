import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[1] / "app.db"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("PRAGMA table_info(inventory_items);")
cols = [row[1] for row in cur.fetchall()]

if "is_btg" not in cols:
    cur.execute("ALTER TABLE inventory_items ADD COLUMN is_btg BOOLEAN NOT NULL DEFAULT 0;")
    conn.commit()
    print("✅ Added is_btg column to inventory_items")
else:
    print("ℹ️ is_btg already exists")

conn.close()
