from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_context
from app.core.cookies import clear_access_token_cookie, set_access_token_cookie
from app.core.rate_limit import AuthRateLimit
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    LogoutResponse,
    RegisterRequest,
    UpdateProfileRequest,
    ForgotPasswordRequest,
    VerifyOtpRequest,
    ResetPasswordRequest,
)
from app.schemas.user import UserPublic
from app.services.auth import authenticate_user, logout_user, register_user
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
    if payload.role is not None:
        current_user.role = payload.role
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





@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    import random
    from datetime import datetime, timedelta, timezone
    from fastapi import HTTPException
    from app.models.otp_verification import OtpVerification

    # Verify if user exists
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Avoid user enumeration by returning 200 OK even if email is not found
        return {"message": "If the email is registered, you will receive an OTP code shortly."}

    # Generate 6-digit OTP
    otp_code = "".join([str(random.randint(0, 9)) for _ in range(6)])
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    # Invalidate existing OTPs for this email
    db.query(OtpVerification).filter(OtpVerification.email == payload.email).delete()

    otp_record = OtpVerification(
        email=payload.email,
        otp_code=otp_code,
        expires_at=expires_at,
        is_verified=False,
    )
    db.add(otp_record)
    db.commit()

    # Simulate email sending:
    print(f"\n==================================================")
    print(f"📧 EMAIL SENT TO: {payload.email}")
    print(f"🔑 RESET PASSWORD OTP CODE: {otp_code}")
    print(f"⏳ EXPIRES AT: {expires_at}")
    print(f"==================================================\n")

    return {"message": "If the email is registered, you will receive an OTP code shortly."}


@router.post("/verify-otp", status_code=status.HTTP_200_OK)
def verify_otp(
    payload: VerifyOtpRequest,
    db: Session = Depends(get_db),
):
    from datetime import datetime, timezone
    from fastapi import HTTPException
    from app.models.otp_verification import OtpVerification

    otp_record = db.query(OtpVerification).filter(
        OtpVerification.email == payload.email,
        OtpVerification.otp_code == payload.otp_code,
    ).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP code.")

    if datetime.now(timezone.utc) > otp_record.expires_at:
        raise HTTPException(status_code=400, detail="OTP code has expired.")

    otp_record.is_verified = True
    db.commit()

    return {"message": "OTP code verified successfully."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    from fastapi import HTTPException
    from app.models.otp_verification import OtpVerification

    otp_record = db.query(OtpVerification).filter(
        OtpVerification.email == payload.email,
        OtpVerification.otp_code == payload.otp_code,
    ).first()

    if not otp_record or not otp_record.is_verified:
        raise HTTPException(status_code=400, detail="OTP code not verified or invalid.")

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Reset password
    user.hashed_password = hash_password(payload.new_password)
    
    # Delete verified OTP record so it can't be reused
    db.delete(otp_record)
    db.commit()

    return {"message": "Password reset successfully."}

