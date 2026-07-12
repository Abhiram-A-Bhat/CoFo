from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.profile_verification import (
    ProfileVerificationPublic,
    ProfileVerificationUpsert,
)
from app.services.profile_verifications import (
    get_my_profile_verification,
    save_my_profile_verification,
)

router = APIRouter(prefix="/profile-verification", tags=["profile-verification"])


@router.get("/me", response_model=ProfileVerificationPublic)
def read_my_profile_verification(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ProfileVerificationPublic:
    return get_my_profile_verification(db, current_user)


@router.put("/me", response_model=ProfileVerificationPublic)
def upsert_my_profile_verification(
    payload: ProfileVerificationUpsert,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ProfileVerificationPublic:
    return save_my_profile_verification(db, user=current_user, payload=payload)
