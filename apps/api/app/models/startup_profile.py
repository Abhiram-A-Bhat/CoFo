from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class StartupProfile(Base):
    __tablename__ = "startup_profiles"

    id: Mapped[UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid4,
    )
    user_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    startup_name: Mapped[str] = mapped_column(String(255), nullable=False)
    industry: Mapped[str] = mapped_column(String(120), nullable=False)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    headquarters: Mapped[str | None] = mapped_column(String(255), nullable=True)
    founded_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    stage: Mapped[str | None] = mapped_column(String(120), nullable=True)
    business_model: Mapped[str | None] = mapped_column(String(255), nullable=True)
    target_market: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    funding_required: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    monthly_revenue: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    annual_recurring_revenue: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    gross_margin_percent: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    net_profit: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    burn_rate: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    runway_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    customer_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    valuation: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    revenue_projection_year1: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    revenue_projection_year2: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    revenue_projection_year3: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    profit_projection_year1: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    profit_projection_year2: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    profit_projection_year3: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    patents_filed: Mapped[int | None] = mapped_column(Integer, nullable=True)
    patents_granted: Mapped[int | None] = mapped_column(Integer, nullable=True)
    traction_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    use_of_funds: Mapped[str | None] = mapped_column(Text, nullable=True)
    pitch_video_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
