"""create service tables

Revision ID: 0001
Revises:
Create Date: 2026-01-15
"""
from alembic import op
import sqlalchemy as sa


revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "service_tables",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("table_number", sa.String(), nullable=False),
        sa.Column("location", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("arrived_at", sa.DateTime(), nullable=True),
        sa.Column("seated_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("step_index", sa.Integer(), nullable=False),
        sa.Column("guest_count", sa.Integer(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_service_tables_status_updated", "service_tables", ["status", "updated_at"])
    op.create_index("ix_service_tables_table_number", "service_tables", ["table_number"])
    op.create_index("ix_service_tables_updated_at", "service_tables", ["updated_at"])

    op.create_table(
        "service_guests",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("table_id", sa.String(), sa.ForeignKey("service_tables.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("allergy", sa.String(), nullable=True),
        sa.Column("protein_sub", sa.String(), nullable=True),
        sa.Column("doneness", sa.String(), nullable=True),
        sa.Column("substitutions", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_service_guests_table_id", "service_guests", ["table_id"])
    op.create_index("ix_service_guests_updated_at", "service_guests", ["updated_at"])

    op.create_table(
        "service_table_wines",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("table_id", sa.String(), sa.ForeignKey("service_tables.id", ondelete="CASCADE"), nullable=False),
        sa.Column("kind", sa.String(), nullable=False),
        sa.Column("wine_id", sa.String(), nullable=True),
        sa.Column("label", sa.String(), nullable=False),
        sa.Column("quantity", sa.Numeric(10, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_service_table_wines_table_id", "service_table_wines", ["table_id"])
    op.create_index("ix_service_table_wines_updated_at", "service_table_wines", ["updated_at"])

    op.create_table(
        "service_step_events",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("table_id", sa.String(), sa.ForeignKey("service_tables.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_type", sa.String(), nullable=False),
        sa.Column("from_step", sa.Integer(), nullable=True),
        sa.Column("to_step", sa.Integer(), nullable=True),
        sa.Column("payload", sa.Text(), nullable=True),
        sa.Column("actor_user_id", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_service_step_events_table_id", "service_step_events", ["table_id"])


def downgrade():
    op.drop_table("service_step_events")
    op.drop_table("service_table_wines")
    op.drop_table("service_guests")
    op.drop_table("service_tables")
