"""Add quest metadata used by the frontend quest lifecycle."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "004_quest_fields"
down_revision: Union[str, Sequence[str], None] = "003_user_auth_profile"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

    
def upgrade() -> None:
    op.add_column("quest", sa.Column("coins", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("quest", sa.Column("duration", sa.String(length=30), nullable=False, server_default="Any time"))
    op.add_column("quest", sa.Column("difficulty", sa.String(length=20), nullable=False, server_default="Easy"))
    op.add_column("quest", sa.Column("theme", sa.String(length=30), nullable=False, server_default="forest"))
    op.add_column("quest", sa.Column("photo_optional", sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade() -> None:
    for column in ("photo_optional", "theme", "difficulty", "duration", "coins"):
        op.drop_column("quest", column)
