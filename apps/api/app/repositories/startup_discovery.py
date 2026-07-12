from decimal import Decimal

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.models.startup_profile import StartupProfile


def search_startup_profiles(
    db: Session,
    *,
    query: str | None,
    industry: str | None,
    funding_min: Decimal | None,
    funding_max: Decimal | None,
    limit: int,
    offset: int,
) -> tuple[list[StartupProfile], int]:
    statement = _apply_filters(
        select(StartupProfile),
        query=query,
        industry=industry,
        funding_min=funding_min,
        funding_max=funding_max,
    ).order_by(StartupProfile.created_at.desc())

    count_statement = _apply_filters(
        select(func.count()).select_from(StartupProfile),
        query=query,
        industry=industry,
        funding_min=funding_min,
        funding_max=funding_max,
    )

    items = list(db.scalars(statement.limit(limit).offset(offset)).all())
    total = db.scalar(count_statement) or 0
    return items, total


def _apply_filters(
    statement: Select,
    *,
    query: str | None,
    industry: str | None,
    funding_min: Decimal | None,
    funding_max: Decimal | None,
) -> Select:
    if query:
        search_term = f"%{query.strip()}%"
        statement = statement.where(
            or_(
                StartupProfile.startup_name.ilike(search_term),
                StartupProfile.industry.ilike(search_term),
                StartupProfile.headquarters.ilike(search_term),
                StartupProfile.stage.ilike(search_term),
                StartupProfile.business_model.ilike(search_term),
                StartupProfile.target_market.ilike(search_term),
                StartupProfile.description.ilike(search_term),
                StartupProfile.traction_summary.ilike(search_term),
                StartupProfile.use_of_funds.ilike(search_term),
            )
        )

    if industry:
        statement = statement.where(StartupProfile.industry.ilike(f"%{industry.strip()}%"))

    if funding_min is not None:
        statement = statement.where(StartupProfile.funding_required >= funding_min)

    if funding_max is not None:
        statement = statement.where(StartupProfile.funding_required <= funding_max)

    return statement
