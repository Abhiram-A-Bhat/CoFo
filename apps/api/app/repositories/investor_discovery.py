from decimal import Decimal

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.models.investor_profile import InvestorProfile


def search_investor_profiles(
    db: Session,
    *,
    query: str | None,
    organization: str | None,
    ticket_min: Decimal | None,
    ticket_max: Decimal | None,
    limit: int,
    offset: int,
) -> tuple[list[InvestorProfile], int]:
    statement = _apply_filters(
        select(InvestorProfile),
        query=query,
        organization=organization,
        ticket_min=ticket_min,
        ticket_max=ticket_max,
    ).order_by(InvestorProfile.created_at.desc())

    count_statement = _apply_filters(
        select(func.count()).select_from(InvestorProfile),
        query=query,
        organization=organization,
        ticket_min=ticket_min,
        ticket_max=ticket_max,
    )

    items = list(db.scalars(statement.limit(limit).offset(offset)).all())
    total = db.scalar(count_statement) or 0
    return items, total


def _apply_filters(
    statement: Select,
    *,
    query: str | None,
    organization: str | None,
    ticket_min: Decimal | None,
    ticket_max: Decimal | None,
) -> Select:
    if query:
        search_term = f"%{query.strip()}%"
        statement = statement.where(
            or_(
                InvestorProfile.name.ilike(search_term),
                InvestorProfile.organization.ilike(search_term),
                InvestorProfile.investment_thesis.ilike(search_term),
            )
        )

    if organization:
        statement = statement.where(
            InvestorProfile.organization.ilike(f"%{organization.strip()}%")
        )

    if ticket_min is not None:
        statement = statement.where(InvestorProfile.ticket_size >= ticket_min)

    if ticket_max is not None:
        statement = statement.where(InvestorProfile.ticket_size <= ticket_max)

    return statement
