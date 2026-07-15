import json
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.profile_verification import ProfileVerification
from app.models.announcement import Announcement
from app.models.system_setting import SystemSetting
from app.repositories.admin import list_users
from app.schemas.admin import (
    AdminUserListResponse,
    AdminUserUpdate,
    AdminAnnouncementCreate,
    AdminAnnouncementPublic,
    AdminMatchSettingsUpdate,
    AdminMatchSettingsPublic,
    AdminVerificationPublic,
)


def list_admin_users(db: Session) -> AdminUserListResponse:
    return AdminUserListResponse(items=list_users(db))


def update_admin_user(db: Session, user_id: UUID, payload: AdminUserUpdate) -> User:
    statement = select(User).where(User.id == user_id)
    user = db.scalar(statement)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    user.role = payload.role
    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user


def list_admin_verifications(db: Session) -> list[AdminVerificationPublic]:
    statement = select(ProfileVerification, User).join(User, ProfileVerification.user_id == User.id)
    results = db.execute(statement).all()
    
    verifications = []
    for pv, user in results:
        verifications.append(
            AdminVerificationPublic(
                id=pv.id,
                user_id=pv.user_id,
                full_name=user.full_name,
                email=user.email,
                linkedin_url=pv.linkedin_url,
                website_url=pv.website_url,
                company_registration=pv.company_registration,
                verification_badges=pv.badges,
                created_at=pv.created_at,
            )
        )
    return verifications


def approve_admin_verification(db: Session, verification_id: UUID) -> bool:
    statement = select(ProfileVerification).where(ProfileVerification.id == verification_id)
    pv = db.scalar(statement)
    if not pv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification request not found.",
        )
    pv.is_verified = True
    pv.rejection_reason = None
    db.commit()
    return True


def reject_admin_verification(db: Session, verification_id: UUID, reason: str | None = None) -> bool:
    statement = select(ProfileVerification).where(ProfileVerification.id == verification_id)
    pv = db.scalar(statement)
    if not pv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification request not found.",
        )
    pv.is_verified = False
    pv.rejection_reason = reason
    # Optionally clear standard fields to reset status
    pv.linkedin_url = None
    pv.website_url = None
    pv.company_registration = None
    db.commit()
    return True


def list_admin_announcements(db: Session) -> list[Announcement]:
    statement = select(Announcement).order_by(Announcement.created_at.desc())
    return list(db.scalars(statement).all())


def create_admin_announcement(db: Session, payload: AdminAnnouncementCreate) -> Announcement:
    announcement = Announcement(content=payload.content)
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


def delete_admin_announcement(db: Session, announcement_id: UUID) -> bool:
    statement = select(Announcement).where(Announcement.id == announcement_id)
    announcement = db.scalar(statement)
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found.",
        )
    db.delete(announcement)
    db.commit()
    return True


def get_admin_settings(db: Session) -> AdminMatchSettingsPublic:
    statement = select(SystemSetting).where(SystemSetting.key == "match_weights")
    setting = db.scalar(statement)
    if not setting:
        # Default settings
        return AdminMatchSettingsPublic(
            industry_weight=0.4,
            ticket_weight=0.4,
            model_weight=0.2,
        )
    
    data = json.loads(setting.value)
    return AdminMatchSettingsPublic(
        industry_weight=data.get("industry_weight", 0.4),
        ticket_weight=data.get("ticket_weight", 0.4),
        model_weight=data.get("model_weight", 0.2),
    )


def update_admin_settings(db: Session, payload: AdminMatchSettingsUpdate) -> AdminMatchSettingsPublic:
    statement = select(SystemSetting).where(SystemSetting.key == "match_weights")
    setting = db.scalar(statement)
    
    data = {
        "industry_weight": payload.industry_weight,
        "ticket_weight": payload.ticket_weight,
        "model_weight": payload.model_weight,
    }
    
    if not setting:
        setting = SystemSetting(key="match_weights", value=json.dumps(data))
        db.add(setting)
    else:
        setting.value = json.dumps(data)
        
    db.commit()
    return AdminMatchSettingsPublic(
        industry_weight=payload.industry_weight,
        ticket_weight=payload.ticket_weight,
        model_weight=payload.model_weight,
    )


def delete_admin_user(db: Session, user_id: UUID) -> bool:
    statement = select(User).where(User.id == user_id)
    user = db.scalar(statement)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    if user.email == "abhiramabhat2005@gmail.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete the primary admin account.",
        )
    db.delete(user)
    db.commit()
    return True


def list_admin_pitches(db: Session) -> list:
    from app.models.startup_profile import StartupProfile
    statement = select(StartupProfile, User).join(User, StartupProfile.user_id == User.id).order_by(StartupProfile.created_at.desc())
    results = db.execute(statement).all()
    return [
        {
            "id": str(sp.id),
            "user_id": str(sp.user_id),
            "startup_name": sp.startup_name,
            "industry": sp.industry,
            "stage": sp.stage,
            "funding_required": str(sp.funding_required),
            "founder_name": user.full_name,
            "founder_email": user.email,
            "created_at": sp.created_at.isoformat(),
        }
        for sp, user in results
    ]


def delete_admin_pitch(db: Session, pitch_id: UUID) -> bool:
    from app.models.startup_profile import StartupProfile
    statement = select(StartupProfile).where(StartupProfile.id == pitch_id)
    pitch = db.scalar(statement)
    if not pitch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pitch not found.",
        )
    db.delete(pitch)
    db.commit()
    return True

