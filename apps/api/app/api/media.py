from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse

from app.api.deps import get_current_user
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix=settings.public_media_path, tags=["media"])


@router.get("/{file_path:path}")
def read_media_file(
    file_path: str,
    current_user: Annotated[User, Depends(get_current_user)],
) -> FileResponse:
    del current_user

    media_root = Path(settings.media_root).resolve()
    requested_path = (media_root / file_path).resolve()

    if media_root not in requested_path.parents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid media path.",
        )

    if not requested_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media file not found.",
        )

    return FileResponse(requested_path)
