from datetime import datetime
from urllib.parse import urlparse
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl, field_validator, model_validator


class ProfileVerificationUpsert(BaseModel):
    linkedin_url: HttpUrl | None = None
    website_url: HttpUrl | None = None
    company_registration: str | None = Field(default=None, max_length=255)

    @field_validator("linkedin_url", "website_url", "company_registration", mode="before")
    @classmethod
    def empty_string_to_none(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @model_validator(mode="after")
    def require_one_verification_signal(self) -> "ProfileVerificationUpsert":
        if not (self.linkedin_url or self.website_url or self.company_registration):
            raise ValueError("Submit at least one verification signal.")
        if self.linkedin_url:
            hostname = urlparse(str(self.linkedin_url)).hostname or ""
            normalized_hostname = hostname.lower()
            if normalized_hostname != "linkedin.com" and not normalized_hostname.endswith(
                ".linkedin.com"
            ):
                raise ValueError("LinkedIn verification must use a linkedin.com URL.")
        if self.website_url:
            hostname = urlparse(str(self.website_url)).hostname or ""
            if hostname.lower() in {"localhost", "127.0.0.1", "::1"}:
                raise ValueError("Website verification must use a public URL.")
        return self


class ProfileVerificationPublic(BaseModel):
    id: UUID
    user_id: UUID
    linkedin_url: HttpUrl | None
    website_url: HttpUrl | None
    company_registration: str | None
    verification_badges: list[str]
    created_at: datetime
    updated_at: datetime


class ProfileVerificationSummary(BaseModel):
    verification_badges: list[str] = Field(default_factory=list)
