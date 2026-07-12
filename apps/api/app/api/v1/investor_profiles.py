from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_investor
from app.db.session import get_db
from app.models.user import User
from app.schemas.investor_profile import InvestorProfilePublic, InvestorProfileUpsert
from app.services.investor_profiles import get_my_investor_profile, save_my_investor_profile

router = APIRouter(prefix="/investor-profile", tags=["investor-profile"])


@router.get("/me", response_model=InvestorProfilePublic)
def read_my_investor_profile(
    current_user: Annotated[User, Depends(get_current_investor)],
    db: Annotated[Session, Depends(get_db)],
) -> InvestorProfilePublic:
    return get_my_investor_profile(db, current_user)


@router.put("/me", response_model=InvestorProfilePublic)
def upsert_my_investor_profile(
    payload: InvestorProfileUpsert,
    current_user: Annotated[User, Depends(get_current_investor)],
    db: Annotated[Session, Depends(get_db)],
) -> InvestorProfilePublic:
    return save_my_investor_profile(db, user=current_user, payload=payload)
