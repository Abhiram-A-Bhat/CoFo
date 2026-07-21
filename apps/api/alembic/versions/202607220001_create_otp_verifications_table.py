"""create otp verifications table

Revision ID: 202607220001
Revises: 202607210001
Create Date: 2026-07-22 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


revision = "202607220001"
down_revision = "202607210001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "otp_verifications",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("otp_code", sa.String(length=6), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_otp_verifications_email", "otp_verifications", ["email"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_otp_verifications_email", table_name="otp_verifications")
    op.drop_table("otp_verifications")
