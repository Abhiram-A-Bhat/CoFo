from decimal import Decimal

from sqlalchemy.orm import Session

from app.schemas.pitch_feed import PitchFeedResponse
from app.services.startup_discovery import discover_startups


def get_pitch_feed(
    db: Session,
    *,
    query: str | None,
    industry: str | None,
    funding_min: Decimal | None,
    funding_max: Decimal | None,
    limit: int,
    offset: int,
) -> PitchFeedResponse:
    response = discover_startups(
        db,
        query=query,
        industry=industry,
        funding_min=funding_min,
        funding_max=funding_max,
        limit=limit,
        offset=offset,
    )
    return PitchFeedResponse(**response.model_dump())
