from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


# ── Comments ──────────────────────────────────────────────────────────
class PitchCommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    parent_id: UUID | None = None


class PitchCommentPublic(BaseModel):
    id: UUID
    startup_profile_id: UUID
    user_id: UUID
    user_name: str
    user_role: str
    parent_id: UUID | None = None
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class PitchCommentListResponse(BaseModel):
    items: list[PitchCommentPublic]
    total: int


# ── Pipeline ──────────────────────────────────────────────────────────
class PipelineItemCreate(BaseModel):
    target_user_id: UUID
    stage: str = "matched"  # matched, intro_sent, meeting_scheduled, due_diligence, term_sheet, closed, passed
    notes: str | None = None


class PipelineItemUpdate(BaseModel):
    stage: str
    notes: str | None = None


class PipelineItemPublic(BaseModel):
    id: UUID
    user_id: UUID
    target_user_id: UUID
    target_name: str
    target_email: str
    target_role: str
    target_subtitle: str | None = None  # Industry or Org name
    stage: str
    notes: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PipelineListResponse(BaseModel):
    items: list[PipelineItemPublic]


# ── Investor Updates ──────────────────────────────────────────────────
class InvestorUpdateCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    month_year: str = Field(..., min_length=3, max_length=50)
    mrr: float | None = None
    runway_months: int | None = None
    highlights: str = Field(..., min_length=5)
    lowlights: str | None = None
    asks: str | None = None
    is_public: bool = True


class InvestorUpdatePublic(BaseModel):
    id: UUID
    startup_profile_id: UUID
    startup_name: str
    title: str
    month_year: str
    mrr: float | None = None
    runway_months: int | None = None
    highlights: str
    lowlights: str | None = None
    asks: str | None = None
    is_public: bool
    created_at: datetime

    class Config:
        from_attributes = True


class InvestorUpdateListResponse(BaseModel):
    items: list[InvestorUpdatePublic]


# ── Watchlist ─────────────────────────────────────────────────────────
class WatchlistItemCreate(BaseModel):
    target_type: str  # "startup" or "investor"
    target_id: UUID


class WatchlistItemPublic(BaseModel):
    id: UUID
    user_id: UUID
    target_type: str
    target_id: UUID
    title: str
    subtitle: str | None = None
    created_at: datetime


class WatchlistListResponse(BaseModel):
    items: list[WatchlistItemPublic]


# ── Notifications ─────────────────────────────────────────────────────
class NotificationPublic(BaseModel):
    id: UUID
    user_id: UUID
    type: str
    title: str
    message: str
    link_url: str | None = None
    is_read: bool
    created_at: datetime


class NotificationListResponse(BaseModel):
    items: list[NotificationPublic]
    unread_count: int


# ── Insights ──────────────────────────────────────────────────────────
class EcosystemInsightsResponse(BaseModel):
    total_startups: int
    total_investors: int
    avg_valuation_inr: float
    avg_funding_required_inr: float
    top_industries: list[dict[str, int | str]]
    active_matches_count: int


# ── Fantasy Angel Portfolio Game ──────────────────────────────────────
class VirtualInvestmentCreate(BaseModel):
    startup_profile_id: UUID
    amount: float = Field(default=100000.0, gt=0)


class VirtualInvestmentPublic(BaseModel):
    id: UUID
    startup_profile_id: UUID
    startup_name: str
    industry: str
    amount: float
    current_value: float
    return_percent: float
    created_at: datetime


class FantasyPortfolioResponse(BaseModel):
    available_credits: float
    total_invested: float
    current_portfolio_value: float
    net_return_percent: float
    investments: list[VirtualInvestmentPublic]
