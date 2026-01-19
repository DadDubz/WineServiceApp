# backend/alembic/env.py
from __future__ import annotations

import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# ------------------------------------------------------------
# Make sure "backend/" is on sys.path so `import app...` works
# ------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend/
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Alembic Config object
config = context.config

# Configure Python logging
# If your alembic.ini logging section is broken, skip it.
try:
    if config.config_file_name is not None:
        fileConfig(config.config_file_name)
except Exception:
    pass

# ------------------------------------------------------------
# Import app settings + SQLAlchemy Base
# ------------------------------------------------------------
from app.core.config import settings  # noqa: E402
from app.db import Base  # noqa: E402

# IMPORTANT: import models so Base.metadata is populated
# Add every model module you want Alembic to "see"
from app.models.user import User  # noqa: F401,E402
from app.models.company import Company  # noqa: F401,E402
from app.models.service import ServiceTable, ServiceGuest, ServiceTableWine, ServiceStepEvent  # noqa: F401,E402

target_metadata = Base.metadata


def get_url() -> str:
    # Use DATABASE_URL from your settings / .env
    return settings.DATABASE_URL


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = get_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        future=True,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
