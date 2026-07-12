from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.profile_verification import ProfileVerification
from app.models.user import User
from app.repositories.profile_verifications import (
    get_profile_verification_by_user_id,
    upsert_profile_verification,
)
from app.schemas.profile_verification import (
    ProfileVerificationPublic,
    ProfileVerificationUpsert,
)


def get_my_profile_verification(db: Session, user: User) -> ProfileVerificationPublic:
    profile_verification = get_profile_verification_by_user_id(db, user.id)
    if profile_verification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile verification not found.",
        )

    return serialize_profile_verification(profile_verification)


def save_my_profile_verification(
    db: Session,
    *,
    user: User,
    payload: ProfileVerificationUpsert,
) -> ProfileVerificationPublic:
    profile_verification = upsert_profile_verification(db, user_id=user.id, payload=payload)
    return serialize_profile_verification(profile_verification)


def get_verification_badges(db: Session, user_id: UUID) -> list[str]:
    profile_verification = get_profile_verification_by_user_id(db, user_id)
    if profile_verification is None:
        return []
    return profile_verification.badges


def serialize_profile_verification(
    profile_verification: ProfileVerification,
) -> ProfileVerificationPublic:
    return ProfileVerificationPublic(
        id=profile_verification.id,
        user_id=profile_verification.user_id,
        linkedin_url=profile_verification.linkedin_url,
        website_url=profile_verification.website_url,
        company_registration=profile_verification.company_registration,
        verification_badges=profile_verification.badges,
        created_at=profile_verification.created_at,
        updated_at=profile_verification.updated_at,
    )
