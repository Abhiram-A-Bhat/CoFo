from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_founder
from app.db.session import get_db
from app.models.user import User
from app.schemas.startup_profile import StartupProfilePublic, StartupProfileUpsert
from app.services.startup_profiles import (
    get_my_startup_profile,
    save_my_pitch_video,
    save_my_startup_profile,
)

router = APIRouter(prefix="/startup-profile", tags=["startup-profile"])


@router.get("/me", response_model=StartupProfilePublic)
def read_my_startup_profile(
    current_user: Annotated[User, Depends(get_current_founder)],
    db: Annotated[Session, Depends(get_db)],
) -> StartupProfilePublic:
    return get_my_startup_profile(db, current_user)


@router.put("/me", response_model=StartupProfilePublic)
def upsert_my_startup_profile(
    payload: StartupProfileUpsert,
    current_user: Annotated[User, Depends(get_current_founder)],
    db: Annotated[Session, Depends(get_db)],
) -> StartupProfilePublic:
    return save_my_startup_profile(db, user=current_user, payload=payload)


@router.post("/me/pitch-video", response_model=StartupProfilePublic)
async def upload_my_pitch_video(
    current_user: Annotated[User, Depends(get_current_founder)],
    db: Annotated[Session, Depends(get_db)],
    file: Annotated[UploadFile, File()],
) -> StartupProfilePublic:
    return await save_my_pitch_video(db, user=current_user, file=file)
