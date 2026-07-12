from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.startup_profile import StartupProfile
from app.models.user import User
from app.repositories.startup_profiles import (
    get_startup_profile_by_user_id,
    update_startup_pitch_video,
    upsert_startup_profile,
)
from app.services.profile_verifications import get_verification_badges
from app.schemas.startup_profile import StartupProfilePublic, StartupProfileUpsert

ALLOWED_PITCH_VIDEO_TYPES = {
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
}


def get_my_startup_profile(db: Session, user: User) -> StartupProfilePublic:
    startup_profile = get_startup_profile_by_user_id(db, user.id)
    if startup_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Startup profile not found.",
        )

    return _serialize_startup_profile(db, startup_profile)


def save_my_startup_profile(
    db: Session,
    *,
    user: User,
    payload: StartupProfileUpsert,
) -> StartupProfilePublic:
    startup_profile = upsert_startup_profile(db, user_id=user.id, payload=payload)
    return _serialize_startup_profile(db, startup_profile)


async def save_my_pitch_video(
    db: Session,
    *,
    user: User,
    file: UploadFile,
) -> StartupProfilePublic:
    if file.content_type not in ALLOWED_PITCH_VIDEO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Upload an MP4, WebM, or MOV video.",
        )

    startup_profile = get_startup_profile_by_user_id(db, user.id)
    if startup_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Create a startup profile before uploading a pitch video.",
        )

    extension = ALLOWED_PITCH_VIDEO_TYPES[file.content_type]
    upload_dir = Path(settings.media_root) / "pitch-videos" / str(user.id)
    upload_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4()}{extension}"
    destination = upload_dir / filename

    total_bytes = 0
    with destination.open("wb") as output:
        while chunk := await file.read(1024 * 1024):
            total_bytes += len(chunk)
            if total_bytes > settings.max_pitch_video_bytes:
                output.close()
                destination.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="Pitch videos must be 150 MB or smaller.",
                )
            output.write(chunk)

    pitch_video_url = (
        f"{settings.public_media_path}/pitch-videos/{user.id}/{filename}"
    )
    updated_profile = update_startup_pitch_video(
        db,
        user_id=user.id,
        pitch_video_url=pitch_video_url,
    )
    if updated_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Startup profile not found.",
        )
    return _serialize_startup_profile(db, updated_profile)


def _serialize_startup_profile(
    db: Session,
    startup_profile: StartupProfile,
) -> StartupProfilePublic:
    return StartupProfilePublic(
        id=startup_profile.id,
        user_id=startup_profile.user_id,
        startup_name=startup_profile.startup_name,
        industry=startup_profile.industry,
        website_url=startup_profile.website_url,
        headquarters=startup_profile.headquarters,
        founded_year=startup_profile.founded_year,
        stage=startup_profile.stage,
        business_model=startup_profile.business_model,
        target_market=startup_profile.target_market,
        description=startup_profile.description,
        funding_required=startup_profile.funding_required,
        monthly_revenue=startup_profile.monthly_revenue,
        annual_recurring_revenue=startup_profile.annual_recurring_revenue,
        gross_margin_percent=startup_profile.gross_margin_percent,
        net_profit=startup_profile.net_profit,
        burn_rate=startup_profile.burn_rate,
        runway_months=startup_profile.runway_months,
        customer_count=startup_profile.customer_count,
        valuation=startup_profile.valuation,
        revenue_projection_year1=startup_profile.revenue_projection_year1,
        revenue_projection_year2=startup_profile.revenue_projection_year2,
        revenue_projection_year3=startup_profile.revenue_projection_year3,
        profit_projection_year1=startup_profile.profit_projection_year1,
        profit_projection_year2=startup_profile.profit_projection_year2,
        profit_projection_year3=startup_profile.profit_projection_year3,
        patents_filed=startup_profile.patents_filed,
        patents_granted=startup_profile.patents_granted,
        traction_summary=startup_profile.traction_summary,
        use_of_funds=startup_profile.use_of_funds,
        pitch_video_url=startup_profile.pitch_video_url,
        verification_badges=get_verification_badges(db, startup_profile.user_id),
        created_at=startup_profile.created_at,
        updated_at=startup_profile.updated_at,
    )
