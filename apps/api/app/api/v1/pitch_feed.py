from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.pitch_feed import PitchFeedResponse
from app.services.pitch_feed import get_pitch_feed

router = APIRouter(prefix="/pitch-feed", tags=["pitch-feed"])


@router.get("", response_model=PitchFeedResponse)
def list_pitch_feed(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    query: Annotated[str | None, Query(max_length=255)] = None,
    industry: Annotated[str | None, Query(max_length=120)] = None,
    funding_min: Decimal | None = None,
    funding_max: Decimal | None = None,
    limit: Annotated[int, Query(ge=1, le=50)] = 12,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> PitchFeedResponse:
    return get_pitch_feed(
        db,
        query=query,
        industry=industry,
        funding_min=funding_min,
        funding_max=funding_max,
        limit=limit,
        offset=offset,
    )
