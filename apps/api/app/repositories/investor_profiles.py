from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.investor_profile import InvestorProfile
from app.schemas.investor_profile import InvestorProfileUpsert


def get_investor_profile_by_user_id(db: Session, user_id: UUID) -> InvestorProfile | None:
    statement = select(InvestorProfile).where(InvestorProfile.user_id == user_id)
    return db.scalar(statement)


def upsert_investor_profile(
    db: Session,
    *,
    user_id: UUID,
    payload: InvestorProfileUpsert,
) -> InvestorProfile:
    investor_profile = get_investor_profile_by_user_id(db, user_id)

    if investor_profile is None:
        investor_profile = InvestorProfile(user_id=user_id)
        db.add(investor_profile)

    investor_profile.name = payload.name
    investor_profile.organization = payload.organization
    investor_profile.investment_thesis = payload.investment_thesis
    investor_profile.ticket_size = payload.ticket_size

    db.commit()
    db.refresh(investor_profile)
    return investor_profile
