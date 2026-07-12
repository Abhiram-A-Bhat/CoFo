from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.admin import (
    AdminUserListResponse,
    AdminUserUpdate,
    AdminAnnouncementCreate,
    AdminAnnouncementPublic,
    AdminMatchSettingsUpdate,
    AdminMatchSettingsPublic,
    AdminVerificationPublic,
)
from app.services.admin import (
    list_admin_users,
    update_admin_user,
    list_admin_verifications,
    approve_admin_verification,
    reject_admin_verification,
    list_admin_announcements,
    create_admin_announcement,
    delete_admin_announcement,
    get_admin_settings,
    update_admin_settings,
)
from app.schemas.user import UserPublic

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=AdminUserListResponse)
def list_users(
    current_user: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> AdminUserListResponse:
    return list_admin_users(db)


@router.put("/users/{user_id}", response_model=UserPublic)
def update_user(
    user_id: UUID,
    payload: AdminUserUpdate,
    current_user: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> UserPublic:
    return update_admin_user(db, user_id=user_id, payload=payload)


@router.get("/verifications", response_model=list[AdminVerificationPublic])
def list_verifications(
    current_user: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> list[AdminVerificationPublic]:
    return list_admin_verifications(db)


@router.post("/verifications/{verification_id}/approve")
def approve_verification(
    verification_id: UUID,
    current_user: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    approve_admin_verification(db, verification_id=verification_id)
    return {"status": "success", "message": "Verification request approved"}


@router.post("/verifications/{verification_id}/reject")
def reject_verification(
    verification_id: UUID,
    current_user: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
    reason: str | None = Query(default=None),
):
    reject_admin_verification(db, verification_id=verification_id, reason=reason)
    return {"status": "success", "message": "Verification request rejected"}


@router.get("/announcements", response_model=list[AdminAnnouncementPublic])
def list_announcements(
    current_user: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> list[AdminAnnouncementPublic]:
    return list_admin_announcements(db)


@router.post("/announcements", response_model=AdminAnnouncementPublic)
def create_announcement(
    payload: AdminAnnouncementCreate,
    current_user: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> AdminAnnouncementPublic:
    return create_admin_announcement(db, payload=payload)


@router.delete("/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: UUID,
    current_user: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    delete_admin_announcement(db, announcement_id=announcement_id)
    return {"status": "success", "message": "Announcement deleted"}


@router.get("/settings", response_model=AdminMatchSettingsPublic)
def get_settings(
    current_user: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> AdminMatchSettingsPublic:
    return get_admin_settings(db)


@router.put("/settings", response_model=AdminMatchSettingsPublic)
def update_settings(
    payload: AdminMatchSettingsUpdate,
    current_user: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> AdminMatchSettingsPublic:
    return update_admin_settings(db, payload=payload)
