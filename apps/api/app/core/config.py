from functools import lru_cache

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "FundFlow AI"
    app_env: str = "local"
    api_v1_prefix: str = "/api/v1"
    backend_cors_origins: list[str] = ["http://localhost:3000"]

    database_url: str = "postgresql+psycopg://fundflow:fundflow_dev_password@localhost:5432/fundflow?connect_timeout=5"

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    auth_cookie_name: str = "fundflow_access_token"
    auth_cookie_secure: bool = False
    auth_cookie_samesite: str = "lax"
    media_root: str = "uploads"
    public_media_path: str = "/media"
    max_pitch_video_bytes: int = 150 * 1024 * 1024

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str] | str:
        import os
        # If default value is present or empty, check if CORS_ORIGINS is set in environment
        if not value or value == ["http://localhost:3000"]:
            env_cors = os.getenv("CORS_ORIGINS")
            if env_cors:
                value = env_cors
        if isinstance(value, str) and value:
            return [origin.strip() for origin in value.split(",")]
        return value

    @field_validator("auth_cookie_samesite")
    @classmethod
    def validate_cookie_samesite(cls, value: str) -> str:
        if not value:
            return "lax"
        normalized = value.strip().strip("'\"").lower()
        if normalized not in {"lax", "strict", "none"}:
            raise ValueError(f"AUTH_COOKIE_SAMESITE must be lax, strict, or none. Got: '{value}'")
        return normalized

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        env_val = self.app_env.strip().strip("'\"").lower()
        if env_val not in {"local", "development", "test"}:
            if len(self.jwt_secret_key) < 32:
                raise ValueError("JWT_SECRET_KEY must be a strong production secret (minimum 32 chars).")
            if not self.auth_cookie_secure:
                raise ValueError("AUTH_COOKIE_SECURE must be true outside local development.")
        return self


import sys
from pydantic import ValidationError

@lru_cache
def get_settings() -> Settings:
    try:
        return Settings()
    except ValidationError as e:
        print("\n=======================================================", file=sys.stderr)
        print("❌ CONFIGURATION ERROR: Failed to load application settings.", file=sys.stderr)
        print("Please check your environment variables on Render:", file=sys.stderr)
        for error in e.errors():
            loc = " -> ".join(str(x) for x in error["loc"])
            print(f"  - {loc}: {error['msg']}", file=sys.stderr)
        print("=======================================================\n", file=sys.stderr)
        sys.exit(1)


settings = get_settings()
