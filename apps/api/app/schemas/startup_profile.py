from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class StartupProfileBase(BaseModel):
    startup_name: str = Field(min_length=1, max_length=255)
    industry: str = Field(min_length=1, max_length=120)
    website_url: str | None = Field(default=None, max_length=500)
    headquarters: str | None = Field(default=None, max_length=255)
    founded_year: int | None = Field(default=None, ge=1800, le=2100)
    stage: str | None = Field(default=None, max_length=120)
    business_model: str | None = Field(default=None, max_length=255)
    target_market: str | None = Field(default=None, max_length=255)
    description: str = Field(min_length=1, max_length=5000)
    funding_required: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    monthly_revenue: Decimal | None = Field(default=None, ge=0, max_digits=14, decimal_places=2)
    annual_recurring_revenue: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=14,
        decimal_places=2,
    )
    gross_margin_percent: Decimal | None = Field(default=None, ge=0, le=100, max_digits=5, decimal_places=2)
    net_profit: Decimal | None = Field(default=None, max_digits=14, decimal_places=2)
    burn_rate: Decimal | None = Field(default=None, ge=0, max_digits=14, decimal_places=2)
    runway_months: int | None = Field(default=None, ge=0, le=600)
    customer_count: int | None = Field(default=None, ge=0)
    valuation: Decimal | None = Field(default=None, ge=0, max_digits=14, decimal_places=2)
    revenue_projection_year1: Decimal | None = Field(default=None, ge=0, max_digits=14, decimal_places=2)
    revenue_projection_year2: Decimal | None = Field(default=None, ge=0, max_digits=14, decimal_places=2)
    revenue_projection_year3: Decimal | None = Field(default=None, ge=0, max_digits=14, decimal_places=2)
    profit_projection_year1: Decimal | None = Field(default=None, max_digits=14, decimal_places=2)
    profit_projection_year2: Decimal | None = Field(default=None, max_digits=14, decimal_places=2)
    profit_projection_year3: Decimal | None = Field(default=None, max_digits=14, decimal_places=2)
    patents_filed: int | None = Field(default=None, ge=0)
    patents_granted: int | None = Field(default=None, ge=0)
    traction_summary: str | None = Field(default=None, max_length=5000)
    use_of_funds: str | None = Field(default=None, max_length=5000)


class StartupProfileUpsert(StartupProfileBase):
    pass


class StartupProfilePublic(StartupProfileBase):
    id: UUID
    user_id: UUID
    pitch_video_url: str | None = None
    verification_badges: list[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
