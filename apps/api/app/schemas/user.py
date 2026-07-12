from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator

UserRole = str


class UserPublic(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str | None
    role: UserRole
    investment_interests: list[str] = Field(default_factory=list)
    is_active: bool
    created_at: datetime

    @field_validator("investment_interests", mode="before")
    @classmethod
    def normalize_interests(cls, value: list[str] | None) -> list[str]:
        return value or []

    model_config = {"from_attributes": True}
