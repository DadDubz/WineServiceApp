"""service table reuse + constraints

Revision ID: 4def63c4ef2b
Revises: 0001
Create Date: 2026-01-19
"""
from alembic import op
import sqlalchemy as sa


revision = "4def63c4ef2b"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # SQLite-safe: add columns first, backfill, then enforce NOT NULL + constraints.

    # 1) Add new columns (nullable + server defaults so existing rows don't break)
    with op.batch_alter_table("service_tables", schema=None) as batch_op:
        # ✅ company_id (default 1 for testing)
        batch_op.add_column(sa.Column("company_id", sa.Integer(), nullable=True, server_default="1"))

        # ✅ service_date (temporary nullable)
        batch_op.add_column(sa.Column("service_date", sa.Date(), nullable=True))

        # ✅ turn (default 1)
        batch_op.add_column(sa.Column("turn", sa.Integer(), nullable=True, server_default="1"))

    # 2) Backfill existing rows
    op.execute("UPDATE service_tables SET company_id = 1 WHERE company_id IS NULL")
    op.execute("UPDATE service_tables SET turn = 1 WHERE turn IS NULL")
    op.execute("UPDATE service_tables SET service_date = DATE('now') WHERE service_date IS NULL")

    # 3) Now enforce NOT NULL (SQLite requires batch)
    with op.batch_alter_table("service_tables", schema=None) as batch_op:
        batch_op.alter_column("company_id", existing_type=sa.Integer(), nullable=False)
        batch_op.alter_column("service_date", existing_type=sa.Date(), nullable=False)
        batch_op.alter_column("turn", existing_type=sa.Integer(), nullable=False)

        # 4) Add index + unique constraint (now columns exist)
        batch_op.create_index(
            "ix_service_tables_company_date_status_updated",
            ["company_id", "service_date", "status", "updated_at"],
            unique=False,
        )
        batch_op.create_unique_constraint(
            "uq_table_use_per_day",
            ["company_id", "service_date", "table_number", "turn"],
        )


def downgrade() -> None:
    with op.batch_alter_table("service_tables", schema=None) as batch_op:
        batch_op.drop_constraint("uq_table_use_per_day", type_="unique")
        batch_op.drop_index("ix_service_tables_company_date_status_updated")

        batch_op.drop_column("turn")
        batch_op.drop_column("service_date")
        batch_op.drop_column("company_id")
