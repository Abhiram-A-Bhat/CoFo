"""add user roles

Revision ID: 202606160006
Revises: 202606160005
Create Date: 2026-06-16 00:06:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202606160006"
down_revision: str | None = "202606160005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "role",
            sa.String(length=32),
            server_default=sa.text("'founder'"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "role")
