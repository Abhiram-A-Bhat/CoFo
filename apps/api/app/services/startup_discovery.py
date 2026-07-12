from decimal import Decimal

from sqlalchemy.orm import Session

from app.repositories.startup_discovery import search_startup_profiles
from app.schemas.startup_discovery import StartupDiscoveryItem, StartupDiscoveryResponse
from app.services.profile_verifications import get_verification_badges


def discover_startups(
    db: Session,
    *,
    query: str | None,
    industry: str | None,
    funding_min: Decimal | None,
    funding_max: Decimal | None,
    limit: int,
    offset: int,
) -> StartupDiscoveryResponse:
    items, total = search_startup_profiles(
        db,
        query=query,
        industry=industry,
        funding_min=funding_min,
        funding_max=funding_max,
        limit=limit,
        offset=offset,
    )
    return StartupDiscoveryResponse(
        items=[
            StartupDiscoveryItem(
                id=item.id,
                user_id=item.user_id,
                startup_name=item.startup_name,
                industry=item.industry,
                website_url=item.website_url,
                headquarters=item.headquarters,
                founded_year=item.founded_year,
                stage=item.stage,
                business_model=item.business_model,
                target_market=item.target_market,
                description=item.description,
                funding_required=item.funding_required,
                monthly_revenue=item.monthly_revenue,
                annual_recurring_revenue=item.annual_recurring_revenue,
                gross_margin_percent=item.gross_margin_percent,
                net_profit=item.net_profit,
                burn_rate=item.burn_rate,
                runway_months=item.runway_months,
                customer_count=item.customer_count,
                valuation=item.valuation,
                revenue_projection_year1=item.revenue_projection_year1,
                revenue_projection_year2=item.revenue_projection_year2,
                revenue_projection_year3=item.revenue_projection_year3,
                profit_projection_year1=item.profit_projection_year1,
                profit_projection_year2=item.profit_projection_year2,
                profit_projection_year3=item.profit_projection_year3,
                patents_filed=item.patents_filed,
                patents_granted=item.patents_granted,
                traction_summary=item.traction_summary,
                use_of_funds=item.use_of_funds,
                pitch_video_url=item.pitch_video_url,
                verification_badges=get_verification_badges(db, item.user_id),
            )
            for item in items
        ],
        total=total,
        limit=limit,
        offset=offset,
    )
