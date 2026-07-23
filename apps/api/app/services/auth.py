from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.revoked_tokens import revoke_token
from app.repositories.users import create_user, get_user_by_email
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, TokenResponse


def register_user(db: Session, payload: RegisterRequest) -> tuple[AuthResponse, datetime]:
    existing_user = get_user_by_email(db, payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    try:
        user = create_user(
            db,
            email=payload.email,
            hashed_password=hash_password(payload.password),
            full_name=payload.full_name,
            role=payload.role,
            investment_interests=(
                payload.investment_interests if payload.role == "investor" else []
            ),
        )
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        ) from exc

    return _build_auth_response(user)


def authenticate_user(db: Session, payload: LoginRequest) -> tuple[AuthResponse, datetime]:
    user = get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    return _build_auth_response(user)


def logout_user(
    db: Session,
    *,
    user: User,
    token_jti: str,
    token_expires_at: datetime,
) -> None:
    revoke_token(
        db,
        jti=token_jti,
        user_id=user.id,
        expires_at=token_expires_at,
    )


def _build_auth_response(user: User) -> tuple[AuthResponse, datetime]:
    access_token, _, expires_at = create_access_token(str(user.id))
    expires_in = int((expires_at - datetime.now(timezone.utc)).total_seconds())
    return (
        AuthResponse(
            user=user,
            token=TokenResponse(access_token=access_token, expires_in=expires_in),
        ),
        expires_at,
    )



