from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_founder
from app.db.session import get_db
from app.models.user import User
from app.schemas.investor_discovery import InvestorDiscoveryResponse
from app.services.investor_discovery import discover_investors

router = APIRouter(prefix="/investor-discovery", tags=["investor-discovery"])


@router.get("", response_model=InvestorDiscoveryResponse)
def list_investors(
    current_user: Annotated[User, Depends(get_current_founder)],
    db: Annotated[Session, Depends(get_db)],
    query: Annotated[str | None, Query(max_length=255)] = None,
    organization: Annotated[str | None, Query(max_length=255)] = None,
    ticket_min: Annotated[Decimal | None, Query(gt=0)] = None,
    ticket_max: Annotated[Decimal | None, Query(gt=0)] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> InvestorDiscoveryResponse:
    return discover_investors(
        db,
        query=query,
        organization=organization,
        ticket_min=ticket_min,
        ticket_max=ticket_max,
        limit=limit,
        offset=offset,
    )
