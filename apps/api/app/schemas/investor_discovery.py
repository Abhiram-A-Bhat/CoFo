from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class InvestorDiscoveryItem(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    organization: str
    investment_thesis: str
    ticket_size: Decimal
    verification_badges: list[str] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class InvestorDiscoveryResponse(BaseModel):
    items: list[InvestorDiscoveryItem]
    total: int
    limit: int
    offset: int
