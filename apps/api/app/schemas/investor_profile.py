from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class InvestorProfileBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    organization: str = Field(min_length=1, max_length=255)
    investment_thesis: str = Field(min_length=1, max_length=5000)
    ticket_size: Decimal = Field(gt=0, max_digits=14, decimal_places=2)


class InvestorProfileUpsert(InvestorProfileBase):
    pass


class InvestorProfilePublic(InvestorProfileBase):
    id: UUID
    user_id: UUID
    verification_badges: list[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
