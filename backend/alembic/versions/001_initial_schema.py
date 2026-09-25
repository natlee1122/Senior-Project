"""Create the ERD-aligned Phase 1 schema.

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-09-25
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001_initial_schema"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(length=80), nullable=False),
        sa.Column("points", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("username"),
    )
    op.create_table(
        "quest",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("category", sa.String(length=30), nullable=False),
        sa.Column("description", sa.String(length=250)),
        sa.Column("points", sa.Integer(), nullable=False),
        sa.Column("location", sa.String(length=100)),
        sa.Column("time_start", sa.DateTime()),
        sa.Column("time_end", sa.DateTime()),
    )
    op.create_table(
        "prop",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("type", sa.String(length=30), nullable=False),
        sa.Column("name", sa.String(length=30), nullable=False),
        sa.Column("price", sa.Integer(), nullable=False),
    )
    op.create_table(
        "user_quest",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("quest_id", sa.Integer(), sa.ForeignKey("quest.id"), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("started_at", sa.DateTime()),
        sa.Column("ended_at", sa.DateTime()),
    )
    op.create_index("ix_user_quest_user_id", "user_quest", ["user_id"])
    op.create_index("ix_user_quest_quest_id", "user_quest", ["quest_id"])
    op.create_table(
        "inventory_item",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("prop_id", sa.Integer(), sa.ForeignKey("prop.id"), nullable=False),
        sa.Column("acquired_at", sa.DateTime(), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_index("ix_inventory_item_user_id", "inventory_item", ["user_id"])
    op.create_index("ix_inventory_item_prop_id", "inventory_item", ["prop_id"])
    op.create_table(
        "event_log",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_quest_id", sa.Integer(), sa.ForeignKey("user_quest.id"), nullable=False),
        sa.Column("recommender", sa.String(length=30)),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("event_type", sa.String(length=30), nullable=False),
        sa.Column("occurred_at", sa.DateTime(), nullable=False),
        sa.Column("context", sa.JSON()),
        sa.Column("model_version", sa.String(length=50)),
        sa.Column("evidence_url", sa.String(length=500)),
    )
    op.create_index("ix_event_log_user_quest_id", "event_log", ["user_quest_id"])


def downgrade() -> None:
    op.drop_index("ix_event_log_user_quest_id", table_name="event_log")
    op.drop_table("event_log")
    op.drop_index("ix_inventory_item_prop_id", table_name="inventory_item")
    op.drop_index("ix_inventory_item_user_id", table_name="inventory_item")
    op.drop_table("inventory_item")
    op.drop_index("ix_user_quest_quest_id", table_name="user_quest")
    op.drop_index("ix_user_quest_user_id", table_name="user_quest")
    op.drop_table("user_quest")
    op.drop_table("prop")
    op.drop_table("quest")
    op.drop_table("user")
