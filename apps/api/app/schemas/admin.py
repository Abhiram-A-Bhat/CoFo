from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from app.schemas.user import UserPublic


class AdminUserListResponse(BaseModel):
    items: list[UserPublic]


class AdminUserUpdate(BaseModel):
    role: str
    is_active: bool


class AdminAnnouncementCreate(BaseModel):
    content: str


class AdminAnnouncementPublic(BaseModel):
    id: UUID
    content: str
    created_at: datetime
    is_active: bool


class AdminMatchSettingsUpdate(BaseModel):
    industry_weight: float = Field(default=0.4, ge=0, le=1.0)
    ticket_weight: float = Field(default=0.4, ge=0, le=1.0)
    model_weight: float = Field(default=0.2, ge=0, le=1.0)


class AdminMatchSettingsPublic(BaseModel):
    industry_weight: float
    ticket_weight: float
    model_weight: float


class AdminVerificationPublic(BaseModel):
    id: UUID
    user_id: UUID
    full_name: str | None
    email: str
    linkedin_url: str | None
    website_url: str | None
    company_registration: str | None
    verification_badges: list[str]
    created_at: datetime
