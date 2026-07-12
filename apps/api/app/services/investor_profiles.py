from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.investor_profile import InvestorProfile
from app.models.user import User
from app.repositories.investor_profiles import (
    get_investor_profile_by_user_id,
    upsert_investor_profile,
)
from app.services.profile_verifications import get_verification_badges
from app.schemas.investor_profile import InvestorProfilePublic, InvestorProfileUpsert


def get_my_investor_profile(db: Session, user: User) -> InvestorProfilePublic:
    investor_profile = get_investor_profile_by_user_id(db, user.id)
    if investor_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investor profile not found.",
        )

    return _serialize_investor_profile(db, investor_profile)


def save_my_investor_profile(
    db: Session,
    *,
    user: User,
    payload: InvestorProfileUpsert,
) -> InvestorProfilePublic:
    investor_profile = upsert_investor_profile(db, user_id=user.id, payload=payload)
    return _serialize_investor_profile(db, investor_profile)


def _serialize_investor_profile(
    db: Session,
    investor_profile: InvestorProfile,
) -> InvestorProfilePublic:
    return InvestorProfilePublic(
        id=investor_profile.id,
        user_id=investor_profile.user_id,
        name=investor_profile.name,
        organization=investor_profile.organization,
        investment_thesis=investor_profile.investment_thesis,
        ticket_size=investor_profile.ticket_size,
        verification_badges=get_verification_badges(db, investor_profile.user_id),
        created_at=investor_profile.created_at,
        updated_at=investor_profile.updated_at,
    )
