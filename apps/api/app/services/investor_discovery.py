from decimal import Decimal

from sqlalchemy.orm import Session

from app.repositories.investor_discovery import search_investor_profiles
from app.schemas.investor_discovery import InvestorDiscoveryItem, InvestorDiscoveryResponse
from app.services.profile_verifications import get_verification_badges


def discover_investors(
    db: Session,
    *,
    query: str | None,
    organization: str | None,
    ticket_min: Decimal | None,
    ticket_max: Decimal | None,
    limit: int,
    offset: int,
) -> InvestorDiscoveryResponse:
    items, total = search_investor_profiles(
        db,
        query=query,
        organization=organization,
        ticket_min=ticket_min,
        ticket_max=ticket_max,
        limit=limit,
        offset=offset,
    )
    return InvestorDiscoveryResponse(
        items=[
            InvestorDiscoveryItem(
                id=item.id,
                user_id=item.user_id,
                name=item.name,
                organization=item.organization,
                investment_thesis=item.investment_thesis,
                ticket_size=item.ticket_size,
                verification_badges=get_verification_badges(db, item.user_id),
            )
            for item in items
        ],
        total=total,
        limit=limit,
        offset=offset,
    )
