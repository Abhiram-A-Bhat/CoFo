from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.profile_verification import ProfileVerification
from app.schemas.profile_verification import ProfileVerificationUpsert


def get_profile_verification_by_user_id(
    db: Session,
    user_id: UUID,
) -> ProfileVerification | None:
    statement = select(ProfileVerification).where(ProfileVerification.user_id == user_id)
    return db.scalar(statement)


def upsert_profile_verification(
    db: Session,
    *,
    user_id: UUID,
    payload: ProfileVerificationUpsert,
) -> ProfileVerification:
    profile_verification = get_profile_verification_by_user_id(db, user_id)

    if profile_verification is None:
        profile_verification = ProfileVerification(user_id=user_id)
        db.add(profile_verification)

    profile_verification.linkedin_url = (
        str(payload.linkedin_url) if payload.linkedin_url else None
    )
    profile_verification.website_url = str(payload.website_url) if payload.website_url else None
    profile_verification.company_registration = payload.company_registration

    db.commit()
    db.refresh(profile_verification)
    return profile_verification
