"""add company diligence and pitch fields

Revision ID: 202606160007
Revises: 202606160006
Create Date: 2026-06-16 00:07:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202606160007"
down_revision: str | None = "202606160006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("users", sa.Column("investment_interests", sa.JSON(), nullable=True))

    op.add_column("startup_profiles", sa.Column("website_url", sa.String(length=500), nullable=True))
    op.add_column("startup_profiles", sa.Column("headquarters", sa.String(length=255), nullable=True))
    op.add_column("startup_profiles", sa.Column("founded_year", sa.Integer(), nullable=True))
    op.add_column("startup_profiles", sa.Column("stage", sa.String(length=120), nullable=True))
    op.add_column("startup_profiles", sa.Column("business_model", sa.String(length=255), nullable=True))
    op.add_column("startup_profiles", sa.Column("target_market", sa.String(length=255), nullable=True))
    op.add_column("startup_profiles", sa.Column("monthly_revenue", sa.Numeric(precision=14, scale=2), nullable=True))
    op.add_column("startup_profiles", sa.Column("annual_recurring_revenue", sa.Numeric(precision=14, scale=2), nullable=True))
    op.add_column("startup_profiles", sa.Column("gross_margin_percent", sa.Numeric(precision=5, scale=2), nullable=True))
    op.add_column("startup_profiles", sa.Column("net_profit", sa.Numeric(precision=14, scale=2), nullable=True))
    op.add_column("startup_profiles", sa.Column("burn_rate", sa.Numeric(precision=14, scale=2), nullable=True))
    op.add_column("startup_profiles", sa.Column("runway_months", sa.Integer(), nullable=True))
    op.add_column("startup_profiles", sa.Column("customer_count", sa.Integer(), nullable=True))
    op.add_column("startup_profiles", sa.Column("valuation", sa.Numeric(precision=14, scale=2), nullable=True))
    op.add_column("startup_profiles", sa.Column("revenue_projection_year1", sa.Numeric(precision=14, scale=2), nullable=True))
    op.add_column("startup_profiles", sa.Column("revenue_projection_year2", sa.Numeric(precision=14, scale=2), nullable=True))
    op.add_column("startup_profiles", sa.Column("revenue_projection_year3", sa.Numeric(precision=14, scale=2), nullable=True))
    op.add_column("startup_profiles", sa.Column("profit_projection_year1", sa.Numeric(precision=14, scale=2), nullable=True))
    op.add_column("startup_profiles", sa.Column("profit_projection_year2", sa.Numeric(precision=14, scale=2), nullable=True))
    op.add_column("startup_profiles", sa.Column("profit_projection_year3", sa.Numeric(precision=14, scale=2), nullable=True))
    op.add_column("startup_profiles", sa.Column("patents_filed", sa.Integer(), nullable=True))
    op.add_column("startup_profiles", sa.Column("patents_granted", sa.Integer(), nullable=True))
    op.add_column("startup_profiles", sa.Column("traction_summary", sa.Text(), nullable=True))
    op.add_column("startup_profiles", sa.Column("use_of_funds", sa.Text(), nullable=True))
    op.add_column("startup_profiles", sa.Column("pitch_video_url", sa.String(length=1000), nullable=True))


def downgrade() -> None:
    op.drop_column("startup_profiles", "pitch_video_url")
    op.drop_column("startup_profiles", "use_of_funds")
    op.drop_column("startup_profiles", "traction_summary")
    op.drop_column("startup_profiles", "patents_granted")
    op.drop_column("startup_profiles", "patents_filed")
    op.drop_column("startup_profiles", "profit_projection_year3")
    op.drop_column("startup_profiles", "profit_projection_year2")
    op.drop_column("startup_profiles", "profit_projection_year1")
    op.drop_column("startup_profiles", "revenue_projection_year3")
    op.drop_column("startup_profiles", "revenue_projection_year2")
    op.drop_column("startup_profiles", "revenue_projection_year1")
    op.drop_column("startup_profiles", "valuation")
    op.drop_column("startup_profiles", "customer_count")
    op.drop_column("startup_profiles", "runway_months")
    op.drop_column("startup_profiles", "burn_rate")
    op.drop_column("startup_profiles", "net_profit")
    op.drop_column("startup_profiles", "gross_margin_percent")
    op.drop_column("startup_profiles", "annual_recurring_revenue")
    op.drop_column("startup_profiles", "monthly_revenue")
    op.drop_column("startup_profiles", "target_market")
    op.drop_column("startup_profiles", "business_model")
    op.drop_column("startup_profiles", "stage")
    op.drop_column("startup_profiles", "founded_year")
    op.drop_column("startup_profiles", "headquarters")
    op.drop_column("startup_profiles", "website_url")

    op.drop_column("users", "investment_interests")
