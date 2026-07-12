from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.matching import InvestorMatchesResponse, StartupMatchesResponse
from app.services.matching import (
    get_investor_matches_for_my_startup,
    get_startup_matches_for_my_investor_profile,
)

router = APIRouter(prefix="/matching", tags=["matching"])


@router.get("/investors", response_model=InvestorMatchesResponse)
def match_investors_for_my_startup(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> InvestorMatchesResponse:
    return get_investor_matches_for_my_startup(db, current_user)


@router.get("/startups", response_model=StartupMatchesResponse)
def match_startups_for_my_investor_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> StartupMatchesResponse:
    return get_startup_matches_for_my_investor_profile(db, current_user)
