"""Add authentication and profile fields to user.

Revision ID: 003_user_auth_profile
Revises: 002_recommendation_impression
Create Date: 2026-10-21
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "003_user_auth_profile"
down_revision: Union[str, Sequence[str], None] = "002_recommendation_impression"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("user", sa.Column("email", sa.String(length=254), nullable=True))
    op.add_column("user", sa.Column("password_hash", sa.String(length=255), nullable=True))
    op.add_column("user", sa.Column("first_name", sa.String(length=50), nullable=False, server_default=""))
    op.add_column("user", sa.Column("last_name", sa.String(length=50), nullable=False, server_default=""))
    op.add_column("user", sa.Column("goal", sa.String(length=120), nullable=False, server_default=""))
    op.add_column("user", sa.Column("interests", sa.JSON(), nullable=False, server_default="[]"))
    op.add_column("user", sa.Column("last_login_at", sa.DateTime(), nullable=True))
    op.create_index("ix_user_email", "user", ["email"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_user_email", table_name="user")
    for column in ("last_login_at", "interests", "goal", "last_name", "first_name", "password_hash", "email"):
        op.drop_column("user", column)
