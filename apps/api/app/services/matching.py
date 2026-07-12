import re
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.investor_profile import InvestorProfile
from app.models.startup_profile import StartupProfile
from app.models.user import User
from app.repositories.investor_profiles import get_investor_profile_by_user_id
from app.repositories.matching import list_investor_profiles, list_startup_profiles
from app.repositories.startup_profiles import get_startup_profile_by_user_id
from app.services.profile_verifications import get_verification_badges
from app.schemas.matching import (
    InvestorMatch,
    InvestorMatchesResponse,
    StartupMatch,
    StartupMatchesResponse,
)


def get_investor_matches_for_my_startup(db: Session, user: User) -> InvestorMatchesResponse:
    startup = get_startup_profile_by_user_id(db, user.id)
    if startup is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Startup profile not found.",
        )

    matches = [
        _score_investor_match(db, startup, investor)
        for investor in list_investor_profiles(db)
        if investor.user_id != user.id
    ]
    matches.sort(key=lambda item: item.match_score, reverse=True)

    return InvestorMatchesResponse(
        startup_id=startup.id,
        startup_name=startup.startup_name,
        items=matches,
    )


def get_startup_matches_for_my_investor_profile(
    db: Session,
    user: User,
) -> StartupMatchesResponse:
    investor = get_investor_profile_by_user_id(db, user.id)
    if investor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investor profile not found.",
        )

    matches = [
        _score_startup_match(db, investor, startup)
        for startup in list_startup_profiles(db)
        if startup.user_id != user.id
    ]
    matches.sort(key=lambda item: item.match_score, reverse=True)

    return StartupMatchesResponse(
        investor_id=investor.id,
        investor_name=investor.name,
        items=matches,
    )


def _score_investor_match(
    db: Session,
    startup: StartupProfile,
    investor: InvestorProfile,
) -> InvestorMatch:
    score, reasons = _calculate_match_score(
        db=db,
        startup=startup,
        investor=investor,
    )
    return InvestorMatch(
        investor_id=investor.id,
        name=investor.name,
        organization=investor.organization,
        investment_thesis=investor.investment_thesis,
        ticket_size=investor.ticket_size,
        verification_badges=get_verification_badges(db, investor.user_id),
        match_score=score,
        reasons=reasons,
    )


def _score_startup_match(
    db: Session,
    investor: InvestorProfile,
    startup: StartupProfile,
) -> StartupMatch:
    score, reasons = _calculate_match_score(
        db=db,
        startup=startup,
        investor=investor,
    )
    return StartupMatch(
        startup_id=startup.id,
        startup_name=startup.startup_name,
        industry=startup.industry,
        description=startup.description,
        funding_required=startup.funding_required,
        verification_badges=get_verification_badges(db, startup.user_id),
        match_score=score,
        reasons=reasons,
    )


def _calculate_match_score(
    db: Session,
    *,
    startup: StartupProfile,
    investor: InvestorProfile,
) -> tuple[int, list[str]]:
    import json
    from app.models.system_setting import SystemSetting
    
    reasons: list[str] = []
    
    # Get settings from DB
    setting = db.scalar(select(SystemSetting).where(SystemSetting.key == "match_weights"))
    if setting:
        try:
            weights = json.loads(setting.value)
            ind_w = float(weights.get("industry_weight", 0.4))
            t_w = float(weights.get("ticket_weight", 0.4))
            m_w = float(weights.get("model_weight", 0.2))
        except Exception:
            ind_w, t_w, m_w = 0.4, 0.4, 0.2
    else:
        ind_w, t_w, m_w = 0.4, 0.4, 0.2

    industry_score = _industry_score(startup.industry, investor.investment_thesis)
    if industry_score >= 25:
        reasons.append("Investor thesis directly references the startup industry.")
    elif industry_score >= 10:
        reasons.append("Investor thesis has partial industry overlap.")

    ticket_score = _ticket_score(startup.funding_required, investor.ticket_size)
    if ticket_score >= 30:
        reasons.append("Ticket size closely fits the funding requirement.")
    elif ticket_score >= 15:
        reasons.append("Ticket size is within a workable range.")

    keyword_score = _keyword_overlap_score(
        f"{startup.startup_name} {startup.industry} {startup.description}",
        f"{investor.organization} {investor.investment_thesis}",
    )
    if keyword_score >= 20:
        reasons.append("Profile language shows strong keyword overlap.")
    elif keyword_score >= 8:
        reasons.append("Profile language shows some keyword overlap.")

    # Calculate weighted score
    # Normalizing factor so weights sum to 1.0
    total_w = ind_w + t_w + m_w
    if total_w > 0:
        ind_w /= total_w
        t_w /= total_w
        m_w /= total_w
        
    # Scale components (industry max=35, ticket max=35, keyword max=30)
    weighted_ind = (industry_score / 35.0) * ind_w * 100.0
    weighted_ticket = (ticket_score / 35.0) * t_w * 100.0
    weighted_keyword = (keyword_score / 30.0) * m_w * 100.0
    
    score = int(weighted_ind + weighted_ticket + weighted_keyword)

    if not reasons:
        reasons.append("Limited available profile data produced a low-confidence match.")

    return min(score, 100), reasons


def _industry_score(industry: str, thesis: str) -> int:
    industry_terms = _terms(industry)
    thesis_terms = _terms(thesis)
    if not industry_terms:
        return 0

    overlap = industry_terms & thesis_terms
    if industry.lower() in thesis.lower():
        return 35

    return min(25, len(overlap) * 12)


def _ticket_score(funding_required: Decimal, ticket_size: Decimal) -> int:
    funding = float(funding_required)
    ticket = float(ticket_size)
    if funding <= 0 or ticket <= 0:
        return 0

    ratio = ticket / funding
    if 0.75 <= ratio <= 1.25:
        return 35
    if 0.5 <= ratio < 0.75 or 1.25 < ratio <= 2:
        return 25
    if 0.25 <= ratio < 0.5 or 2 < ratio <= 4:
        return 15
    return 5


def _keyword_overlap_score(left: str, right: str) -> int:
    left_terms = _terms(left)
    right_terms = _terms(right)
    if not left_terms or not right_terms:
        return 0

    overlap = left_terms & right_terms
    density = len(overlap) / max(len(left_terms), 1)
    return min(30, int(density * 100))


def _terms(value: str) -> set[str]:
    stop_words = {
        "and",
        "for",
        "the",
        "with",
        "into",
        "from",
        "that",
        "this",
        "their",
        "your",
        "our",
        "are",
        "has",
        "have",
    }
    return {
        term
        for term in re.findall(r"[a-zA-Z0-9]+", value.lower())
        if len(term) > 2 and term not in stop_words
    }
