from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_investor
from app.db.session import get_db
from app.models.user import User
from app.schemas.startup_discovery import StartupDiscoveryResponse
from app.services.startup_discovery import discover_startups

router = APIRouter(prefix="/startup-discovery", tags=["startup-discovery"])


@router.get("", response_model=StartupDiscoveryResponse)
def list_startups(
    current_user: Annotated[User, Depends(get_current_investor)],
    db: Annotated[Session, Depends(get_db)],
    query: Annotated[str | None, Query(max_length=255)] = None,
    industry: Annotated[str | None, Query(max_length=120)] = None,
    funding_min: Annotated[Decimal | None, Query(gt=0)] = None,
    funding_max: Annotated[Decimal | None, Query(gt=0)] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> StartupDiscoveryResponse:
    return discover_startups(
        db,
        query=query,
        industry=industry,
        funding_min=funding_min,
        funding_max=funding_max,
        limit=limit,
        offset=offset,
    )
