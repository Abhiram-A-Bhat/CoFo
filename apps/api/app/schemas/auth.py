from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.user import UserPublic


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)
    role: Literal["founder", "investor"] = "founder"
    investment_interests: list[str] = Field(default_factory=list, max_length=12)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not any(character.isupper() for character in value):
            raise ValueError("Password must include at least one capital (uppercase) letter.")
        return value

    @field_validator("investment_interests")
    @classmethod
    def validate_interests(cls, value: list[str]) -> list[str]:
        normalized = []
        for interest in value:
            clean_interest = interest.strip()
            if clean_interest and clean_interest not in normalized:
                normalized.append(clean_interest[:80])
        return normalized


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class AuthResponse(BaseModel):
    user: UserPublic
    token: TokenResponse


class LogoutResponse(BaseModel):
    message: str
