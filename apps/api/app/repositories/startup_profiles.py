from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.startup_profile import StartupProfile
from app.schemas.startup_profile import StartupProfileUpsert

STARTUP_PROFILE_FIELDS = (
    "startup_name",
    "industry",
    "website_url",
    "headquarters",
    "founded_year",
    "stage",
    "business_model",
    "target_market",
    "description",
    "funding_required",
    "monthly_revenue",
    "annual_recurring_revenue",
    "gross_margin_percent",
    "net_profit",
    "burn_rate",
    "runway_months",
    "customer_count",
    "valuation",
    "revenue_projection_year1",
    "revenue_projection_year2",
    "revenue_projection_year3",
    "profit_projection_year1",
    "profit_projection_year2",
    "profit_projection_year3",
    "patents_filed",
    "patents_granted",
    "traction_summary",
    "use_of_funds",
)


def get_startup_profile_by_user_id(db: Session, user_id: UUID) -> StartupProfile | None:
    statement = select(StartupProfile).where(StartupProfile.user_id == user_id)
    return db.scalar(statement)


def upsert_startup_profile(
    db: Session,
    *,
    user_id: UUID,
    payload: StartupProfileUpsert,
) -> StartupProfile:
    startup_profile = get_startup_profile_by_user_id(db, user_id)

    if startup_profile is None:
        startup_profile = StartupProfile(user_id=user_id)
        db.add(startup_profile)

    for field_name in STARTUP_PROFILE_FIELDS:
        setattr(startup_profile, field_name, getattr(payload, field_name))

    db.commit()
    db.refresh(startup_profile)
    return startup_profile


def update_startup_pitch_video(
    db: Session,
    *,
    user_id: UUID,
    pitch_video_url: str,
) -> StartupProfile | None:
    startup_profile = get_startup_profile_by_user_id(db, user_id)

    if startup_profile is None:
        return None

    startup_profile.pitch_video_url = pitch_video_url
    db.commit()
    db.refresh(startup_profile)
    return startup_profile
