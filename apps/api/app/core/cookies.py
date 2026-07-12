from datetime import datetime, timezone

from fastapi import Response

from app.core.config import settings


def set_access_token_cookie(
    response: Response,
    *,
    access_token: str,
    expires_at: datetime,
) -> None:
    max_age = max(0, int((expires_at - datetime.now(timezone.utc)).total_seconds()))
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=access_token,
        max_age=max_age,
        expires=max_age,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite=settings.auth_cookie_samesite,
        path="/",
    )


def clear_access_token_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.auth_cookie_name,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite=settings.auth_cookie_samesite,
        path="/",
    )
