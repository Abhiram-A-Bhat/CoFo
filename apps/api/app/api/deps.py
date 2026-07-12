from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID

from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.repositories.revoked_tokens import is_token_revoked
from app.repositories.users import get_user_by_id

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user_context(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[Session, Depends(get_db)],
    cookie_token: Annotated[str | None, Cookie(alias=settings.auth_cookie_name)] = None,
) -> tuple[User, str, datetime]:
    token = credentials.credentials if credentials else cookie_token
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(token)
        subject = payload.get("sub")
        token_jti = payload.get("jti")
        expires_at_timestamp = payload.get("exp")
        if not subject or not token_jti or not expires_at_timestamp:
            raise ValueError("Malformed token")
        user_id = UUID(subject)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if is_token_revoked(db, token_jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is not available.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expires_at = datetime.fromtimestamp(expires_at_timestamp, timezone.utc)
    return user, token_jti, expires_at


def get_current_user(
    context: Annotated[tuple[User, str, datetime], Depends(get_current_user_context)],
) -> User:
    user, _, _ = context
    return user


def require_role(user: User, allowed_roles: set[str]) -> User:
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this interface.",
        )
    return user


def get_current_founder(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    return current_user


def get_current_investor(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    return current_user


def get_current_admin(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    return require_role(current_user, {"admin"})
