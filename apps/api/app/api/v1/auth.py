from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_context
from app.core.cookies import clear_access_token_cookie, set_access_token_cookie
from app.core.rate_limit import AuthRateLimit
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, LogoutResponse, RegisterRequest
from app.schemas.user import UserPublic
from app.services.auth import authenticate_user, logout_user, register_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=UserPublic)
def read_current_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserPublic:
    return current_user


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    db: Annotated[Session, Depends(get_db)],
    response: Response,
    _: AuthRateLimit,
) -> AuthResponse:
    auth_response, expires_at = register_user(db, payload)
    set_access_token_cookie(
        response,
        access_token=auth_response.token.access_token,
        expires_at=expires_at,
    )
    return auth_response


@router.post("/login", response_model=AuthResponse)
def login(
    payload: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
    response: Response,
    _: AuthRateLimit,
) -> AuthResponse:
    auth_response, expires_at = authenticate_user(db, payload)
    set_access_token_cookie(
        response,
        access_token=auth_response.token.access_token,
        expires_at=expires_at,
    )
    return auth_response


@router.post("/logout", response_model=LogoutResponse)
def logout(
    context: Annotated[tuple[User, str, datetime], Depends(get_current_user_context)],
    db: Annotated[Session, Depends(get_db)],
    response: Response,
) -> LogoutResponse:
    user, token_jti, token_expires_at = context
    logout_user(
        db,
        user=user,
        token_jti=token_jti,
        token_expires_at=token_expires_at,
    )
    clear_access_token_cookie(response)
    return LogoutResponse(message="Logged out successfully.")


@router.get("/announcements")
def get_announcements(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    from app.services.admin import list_admin_announcements
    return list_admin_announcements(db)
