from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_context
from app.core.cookies import clear_access_token_cookie, set_access_token_cookie
from app.core.rate_limit import AuthRateLimit
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, LogoutResponse, RegisterRequest, UpdateProfileRequest
from app.schemas.user import UserPublic
from app.services.auth import authenticate_user, logout_user, register_user, google_oauth_login
from app.core.security import hash_password
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=UserPublic)
def read_current_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserPublic:
    return current_user


@router.patch("/me", response_model=UserPublic)
def update_current_user(
    payload: UpdateProfileRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserPublic:
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.password is not None:
        current_user.hashed_password = hash_password(payload.password)
    db.commit()
    db.refresh(current_user)
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


@router.get("/google")
def google_login():
    """Redirect the browser to Google's OAuth consent screen."""
    import urllib.parse
    if not settings.google_client_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Google OAuth is not configured on this server.")

    params = urllib.parse.urlencode({
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    })
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"https://accounts.google.com/o/oauth2/v2/auth?{params}")


@router.get("/google/callback")
def google_callback(
    code: str,
    db: Annotated[Session, Depends(get_db)],
    response: Response,
    error: str | None = None,
):
    """Handle Google's redirect, exchange code for user info, issue JWT."""
    import httpx
    from fastapi.responses import RedirectResponse

    if error:
        return RedirectResponse(url=f"{settings.frontend_url}/login?error=google_denied")

    # Exchange code for tokens
    try:
        token_resp = httpx.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
            timeout=10,
        )
        token_resp.raise_for_status()
        tokens = token_resp.json()
    except Exception:
        return RedirectResponse(url=f"{settings.frontend_url}/login?error=google_token_failed")

    # Fetch user info from Google
    try:
        userinfo_resp = httpx.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
            timeout=10,
        )
        userinfo_resp.raise_for_status()
        userinfo = userinfo_resp.json()
    except Exception:
        return RedirectResponse(url=f"{settings.frontend_url}/login?error=google_userinfo_failed")

    google_id: str = userinfo.get("sub", "")
    email: str = userinfo.get("email", "")
    full_name: str | None = userinfo.get("name")

    if not google_id or not email:
        return RedirectResponse(url=f"{settings.frontend_url}/login?error=google_no_email")

    # Log in or create the user
    try:
        auth_response, expires_at = google_oauth_login(
            db, google_id=google_id, email=email, full_name=full_name
        )
    except Exception:
        return RedirectResponse(url=f"{settings.frontend_url}/login?error=google_login_failed")

    # Build a redirect response and set the auth cookie on it
    redirect = RedirectResponse(
        url=f"{settings.frontend_url}/choose-interface",
        status_code=302,
    )
    set_access_token_cookie(redirect, access_token=auth_response.token.access_token, expires_at=expires_at)

    # Also pass the token in a query param so the frontend can store it in localStorage
    redirect = RedirectResponse(
        url=f"{settings.frontend_url}/auth/google/complete?token={auth_response.token.access_token}",
        status_code=302,
    )
    set_access_token_cookie(redirect, access_token=auth_response.token.access_token, expires_at=expires_at)
    return redirect
