from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class StartupDiscoveryItem(BaseModel):
    id: UUID
    user_id: UUID
    startup_name: str
    industry: str
    website_url: str | None = None
    headquarters: str | None = None
    founded_year: int | None = None
    stage: str | None = None
    business_model: str | None = None
    target_market: str | None = None
    description: str
    funding_required: Decimal
    monthly_revenue: Decimal | None = None
    annual_recurring_revenue: Decimal | None = None
    gross_margin_percent: Decimal | None = None
    net_profit: Decimal | None = None
    burn_rate: Decimal | None = None
    runway_months: int | None = None
    customer_count: int | None = None
    valuation: Decimal | None = None
    revenue_projection_year1: Decimal | None = None
    revenue_projection_year2: Decimal | None = None
    revenue_projection_year3: Decimal | None = None
    profit_projection_year1: Decimal | None = None
    profit_projection_year2: Decimal | None = None
    profit_projection_year3: Decimal | None = None
    patents_filed: int | None = None
    patents_granted: int | None = None
    traction_summary: str | None = None
    use_of_funds: str | None = None
    pitch_video_url: str | None = None
    verification_badges: list[str] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class StartupDiscoveryResponse(BaseModel):
    items: list[StartupDiscoveryItem]
    total: int
    limit: int
    offset: int
