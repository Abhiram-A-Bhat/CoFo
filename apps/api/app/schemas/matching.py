from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class InvestorMatch(BaseModel):
    investor_id: UUID
    name: str
    organization: str
    investment_thesis: str
    ticket_size: Decimal
    verification_badges: list[str] = Field(default_factory=list)
    match_score: int
    reasons: list[str]


class StartupMatch(BaseModel):
    startup_id: UUID
    startup_name: str
    industry: str
    description: str
    funding_required: Decimal
    verification_badges: list[str] = Field(default_factory=list)
    match_score: int
    reasons: list[str]


class InvestorMatchesResponse(BaseModel):
    startup_id: UUID
    startup_name: str
    items: list[InvestorMatch]


class StartupMatchesResponse(BaseModel):
    investor_id: UUID
    investor_name: str
    items: list[StartupMatch]
