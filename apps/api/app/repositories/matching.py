from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.investor_profile import InvestorProfile
from app.models.startup_profile import StartupProfile


def list_investor_profiles(db: Session) -> list[InvestorProfile]:
    statement = select(InvestorProfile).order_by(InvestorProfile.created_at.desc())
    return list(db.scalars(statement).all())


def list_startup_profiles(db: Session) -> list[StartupProfile]:
    statement = select(StartupProfile).order_by(StartupProfile.created_at.desc())
    return list(db.scalars(statement).all())
