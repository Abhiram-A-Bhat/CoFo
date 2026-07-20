from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func, delete, update

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.startup_profile import StartupProfile
from app.models.investor_profile import InvestorProfile
from app.models.pitch_comment import PitchComment
from app.models.pipeline_item import PipelineItem
from app.models.investor_update import InvestorUpdate
from app.models.watchlist_item import WatchlistItem
from app.models.notification import Notification
from app.schemas.retention import (
    PitchCommentCreate,
    PitchCommentPublic,
    PitchCommentListResponse,
    PipelineItemCreate,
    PipelineItemUpdate,
    PipelineItemPublic,
    PipelineListResponse,
    InvestorUpdateCreate,
    InvestorUpdatePublic,
    InvestorUpdateListResponse,
    WatchlistItemCreate,
    WatchlistItemPublic,
    WatchlistListResponse,
    NotificationPublic,
    NotificationListResponse,
    EcosystemInsightsResponse,
)

router = APIRouter(tags=["retention"])


# ── PITCH COMMENTS ───────────────────────────────────────────────────
@router.get("/pitches/{startup_profile_id}/comments", response_model=PitchCommentListResponse)
def list_pitch_comments(
    startup_profile_id: UUID,
    db: Session = Depends(get_db),
):
    stmt = (
        select(PitchComment, User.full_name, User.email, User.role)
        .join(User, PitchComment.user_id == User.id)
        .where(PitchComment.startup_profile_id == startup_profile_id)
        .order_by(PitchComment.created_at.asc())
    )
    results = db.execute(stmt).all()

    items = []
    for comment, full_name, email, role in results:
        items.append(
            PitchCommentPublic(
                id=comment.id,
                startup_profile_id=comment.startup_profile_id,
                user_id=comment.user_id,
                user_name=full_name or email.split("@")[0],
                user_role=role,
                parent_id=comment.parent_id,
                content=comment.content,
                created_at=comment.created_at,
            )
        )

    return PitchCommentListResponse(items=items, total=len(items))


@router.post("/pitches/{startup_profile_id}/comments", response_model=PitchCommentPublic, status_code=status.HTTP_201_CREATED)
def create_pitch_comment(
    startup_profile_id: UUID,
    payload: PitchCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    startup = db.execute(select(StartupProfile).where(StartupProfile.id == startup_profile_id)).scalar_one_or_none()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup profile not found")

    comment = PitchComment(
        startup_profile_id=startup_profile_id,
        user_id=current_user.id,
        parent_id=payload.parent_id,
        content=payload.content.strip(),
    )
    db.add(comment)

    # Trigger notification for startup owner if comment is not by owner
    if startup.user_id != current_user.id:
        notif = Notification(
            user_id=startup.user_id,
            type="comment",
            title="New Comment on Your Pitch",
            message=f"{current_user.full_name or current_user.email} commented: \"{comment.content[:80]}\"",
            link_url="/pitch-feed",
        )
        db.add(notif)

    db.commit()
    db.refresh(comment)

    return PitchCommentPublic(
        id=comment.id,
        startup_profile_id=comment.startup_profile_id,
        user_id=comment.user_id,
        user_name=current_user.full_name or current_user.email.split("@")[0],
        user_role=current_user.role,
        parent_id=comment.parent_id,
        content=comment.content,
        created_at=comment.created_at,
    )


# ── KANBAN PIPELINE ──────────────────────────────────────────────────
@router.get("/pipeline", response_model=PipelineListResponse)
def get_user_pipeline(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(PipelineItem, User.full_name, User.email, User.role)
        .join(User, PipelineItem.target_user_id == User.id)
        .where(PipelineItem.user_id == current_user.id)
        .order_by(PipelineItem.updated_at.desc())
    )
    results = db.execute(stmt).all()

    items = []
    for p, full_name, email, role in results:
        subtitle = None
        if role == "founder":
            sp = db.execute(select(StartupProfile).where(StartupProfile.user_id == p.target_user_id)).scalar_one_or_none()
            if sp:
                subtitle = sp.startup_name or sp.industry
        elif role == "investor":
            ip = db.execute(select(InvestorProfile).where(InvestorProfile.user_id == p.target_user_id)).scalar_one_or_none()
            if ip:
                subtitle = ip.organization or ip.name

        items.append(
            PipelineItemPublic(
                id=p.id,
                user_id=p.user_id,
                target_user_id=p.target_user_id,
                target_name=full_name or email.split("@")[0],
                target_email=email,
                target_role=role,
                target_subtitle=subtitle,
                stage=p.stage,
                notes=p.notes,
                created_at=p.created_at,
                updated_at=p.updated_at,
            )
        )

    return PipelineListResponse(items=items)


@router.post("/pipeline", response_model=PipelineItemPublic, status_code=status.HTTP_201_CREATED)
def add_pipeline_item(
    payload: PipelineItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.execute(
        select(PipelineItem).where(
            PipelineItem.user_id == current_user.id,
            PipelineItem.target_user_id == payload.target_user_id,
        )
    ).scalar_one_or_none()

    if existing:
        existing.stage = payload.stage
        if payload.notes:
            existing.notes = payload.notes
        db.commit()
        db.refresh(existing)
        item = existing
    else:
        item = PipelineItem(
            user_id=current_user.id,
            target_user_id=payload.target_user_id,
            stage=payload.stage,
            notes=payload.notes,
        )
        db.add(item)
        db.commit()
        db.refresh(item)

    target_user = db.execute(select(User).where(User.id == payload.target_user_id)).scalar_one_or_none()
    target_name = target_user.full_name or target_user.email if target_user else "User"
    target_role = target_user.role if target_user else "user"

    return PipelineItemPublic(
        id=item.id,
        user_id=item.user_id,
        target_user_id=item.target_user_id,
        target_name=target_name,
        target_email=target_user.email if target_user else "",
        target_role=target_role,
        stage=item.stage,
        notes=item.notes,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


@router.patch("/pipeline/{item_id}", response_model=PipelineItemPublic)
def update_pipeline_stage(
    item_id: UUID,
    payload: PipelineItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.execute(
        select(PipelineItem).where(
            PipelineItem.id == item_id,
            PipelineItem.user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Pipeline item not found")

    item.stage = payload.stage
    if payload.notes is not None:
        item.notes = payload.notes

    db.commit()
    db.refresh(item)

    target_user = db.execute(select(User).where(User.id == item.target_user_id)).scalar_one_or_none()

    return PipelineItemPublic(
        id=item.id,
        user_id=item.user_id,
        target_user_id=item.target_user_id,
        target_name=target_user.full_name or target_user.email if target_user else "User",
        target_email=target_user.email if target_user else "",
        target_role=target_user.role if target_user else "user",
        stage=item.stage,
        notes=item.notes,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


@router.delete("/pipeline/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pipeline_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.execute(
        delete(PipelineItem).where(
            PipelineItem.id == item_id,
            PipelineItem.user_id == current_user.id,
        )
    )
    db.commit()


# ── INVESTOR UPDATES (MONTHLY IR) ────────────────────────────────────
@router.get("/startup-profile/{startup_profile_id}/updates", response_model=InvestorUpdateListResponse)
def list_investor_updates(
    startup_profile_id: UUID,
    db: Session = Depends(get_db),
):
    sp = db.execute(select(StartupProfile).where(StartupProfile.id == startup_profile_id)).scalar_one_or_none()
    if not sp:
        raise HTTPException(status_code=404, detail="Startup profile not found")

    updates = db.execute(
        select(InvestorUpdate)
        .where(InvestorUpdate.startup_profile_id == startup_profile_id)
        .order_by(InvestorUpdate.created_at.desc())
    ).scalars().all()

    items = [
        InvestorUpdatePublic(
            id=u.id,
            startup_profile_id=u.startup_profile_id,
            startup_name=sp.startup_name or "Startup",
            title=u.title,
            month_year=u.month_year,
            mrr=float(u.mrr) if u.mrr else None,
            runway_months=u.runway_months,
            highlights=u.highlights,
            lowlights=u.lowlights,
            asks=u.asks,
            is_public=u.is_public,
            created_at=u.created_at,
        )
        for u in updates
    ]

    return InvestorUpdateListResponse(items=items)


@router.post("/startup-profile/me/updates", response_model=InvestorUpdatePublic, status_code=status.HTTP_201_CREATED)
def create_investor_update(
    payload: InvestorUpdateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sp = db.execute(select(StartupProfile).where(StartupProfile.user_id == current_user.id)).scalar_one_or_none()
    if not sp:
        raise HTTPException(status_code=400, detail="Create a startup profile first before posting updates.")

    update_obj = InvestorUpdate(
        startup_profile_id=sp.id,
        title=payload.title,
        month_year=payload.month_year,
        mrr=payload.mrr,
        runway_months=payload.runway_months,
        highlights=payload.highlights,
        lowlights=payload.lowlights,
        asks=payload.asks,
        is_public=payload.is_public,
    )
    db.add(update_obj)
    db.commit()
    db.refresh(update_obj)

    return InvestorUpdatePublic(
        id=update_obj.id,
        startup_profile_id=update_obj.startup_profile_id,
        startup_name=sp.startup_name or "Startup",
        title=update_obj.title,
        month_year=update_obj.month_year,
        mrr=float(update_obj.mrr) if update_obj.mrr else None,
        runway_months=update_obj.runway_months,
        highlights=update_obj.highlights,
        lowlights=update_obj.lowlights,
        asks=update_obj.asks,
        is_public=update_obj.is_public,
        created_at=update_obj.created_at,
    )


# ── WATCHLIST & BOOKMARKS ────────────────────────────────────────────
@router.get("/watchlist", response_model=WatchlistListResponse)
def get_watchlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = db.execute(
        select(WatchlistItem).where(WatchlistItem.user_id == current_user.id).order_by(WatchlistItem.created_at.desc())
    ).scalars().all()

    result = []
    for item in items:
        title = "Saved Item"
        subtitle = None

        if item.target_type == "startup":
            sp = db.execute(select(StartupProfile).where(StartupProfile.id == item.target_id)).scalar_one_or_none()
            if sp:
                title = sp.startup_name or "Startup"
                subtitle = sp.industry
        elif item.target_type == "investor":
            ip = db.execute(select(InvestorProfile).where(InvestorProfile.id == item.target_id)).scalar_one_or_none()
            if ip:
                title = ip.name or "Investor"
                subtitle = ip.organization

        result.append(
            WatchlistItemPublic(
                id=item.id,
                user_id=item.user_id,
                target_type=item.target_type,
                target_id=item.target_id,
                title=title,
                subtitle=subtitle,
                created_at=item.created_at,
            )
        )

    return WatchlistListResponse(items=result)


@router.post("/watchlist/toggle", status_code=status.HTTP_200_OK)
def toggle_watchlist_item(
    payload: WatchlistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.execute(
        select(WatchlistItem).where(
            WatchlistItem.user_id == current_user.id,
            WatchlistItem.target_id == payload.target_id,
        )
    ).scalar_one_or_none()

    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False, "message": "Removed from watchlist"}
    else:
        new_item = WatchlistItem(
            user_id=current_user.id,
            target_type=payload.target_type,
            target_id=payload.target_id,
        )
        db.add(new_item)
        db.commit()
        return {"saved": True, "message": "Saved to watchlist"}


# ── NOTIFICATIONS ────────────────────────────────────────────────────
@router.get("/notifications", response_model=NotificationListResponse)
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notifs = db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(30)
    ).scalars().all()

    unread_count = sum(1 for n in notifs if not n.is_read)

    items = [
        NotificationPublic(
            id=n.id,
            user_id=n.user_id,
            type=n.type,
            title=n.title,
            message=n.message,
            link_url=n.link_url,
            is_read=n.is_read,
            created_at=n.created_at,
        )
        for n in notifs
    ]

    return NotificationListResponse(items=items, unread_count=unread_count)


@router.post("/notifications/read-all", status_code=status.HTTP_200_OK)
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True)
    )
    db.commit()
    return {"message": "All notifications marked as read"}


# ── MARKET INSIGHTS & BENCHMARKS ─────────────────────────────────────
@router.get("/insights", response_model=EcosystemInsightsResponse)
def get_ecosystem_insights(db: Session = Depends(get_db)):
    total_startups = db.execute(select(func.count(StartupProfile.id))).scalar() or 0
    total_investors = db.execute(select(func.count(InvestorProfile.id))).scalar() or 0

    avg_val = db.execute(select(func.avg(StartupProfile.valuation))).scalar() or 50000000.0
    avg_req = db.execute(select(func.avg(StartupProfile.funding_required))).scalar() or 10000000.0

    industry_counts = db.execute(
        select(StartupProfile.industry, func.count(StartupProfile.id))
        .group_by(StartupProfile.industry)
        .order_by(func.count(StartupProfile.id).desc())
        .limit(5)
    ).all()

    top_industries = [
        {"industry": ind or "General Tech", "count": cnt} for ind, cnt in industry_counts
    ]

    return EcosystemInsightsResponse(
        total_startups=total_startups,
        total_investors=total_investors,
        avg_valuation_inr=float(avg_val),
        avg_funding_required_inr=float(avg_req),
        top_industries=top_industries,
        active_matches_count=total_startups * total_investors,
    )


# ── FANTASY ANGEL PORTFOLIO ──────────────────────────────────────────
@router.get("/portfolio", response_model=FantasyPortfolioResponse)
def get_fantasy_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.virtual_investment import VirtualInvestment
    from app.schemas.retention import VirtualInvestmentPublic, FantasyPortfolioResponse

    investments = db.execute(
        select(VirtualInvestment).where(VirtualInvestment.user_id == current_user.id).order_by(VirtualInvestment.created_at.desc())
    ).scalars().all()

    INITIAL_CREDITS = 1000000.0  # ₹10,00,000 starting Virtual Portfolio
    total_invested = sum(float(inv.amount) for inv in investments)
    available_credits = max(0.0, INITIAL_CREDITS - total_invested)

    portfolio_items = []
    current_portfolio_value = 0.0

    for inv in investments:
        sp = db.execute(select(StartupProfile).where(StartupProfile.id == inv.startup_profile_id)).scalar_one_or_none()
        name = sp.startup_name if sp else "Startup"
        ind = sp.industry if sp else "General"

        # Dynamically calculate growth multiplier based on comments/watchlist traction
        comment_cnt = db.execute(select(func.count(PitchComment.id)).where(PitchComment.startup_profile_id == inv.startup_profile_id)).scalar() or 0
        multiplier = 1.0 + (comment_cnt * 0.15)  # 15% gain per comment
        current_val = float(inv.amount) * multiplier
        current_portfolio_value += current_val
        ret_pct = ((current_val - float(inv.amount)) / float(inv.amount)) * 100.0

        portfolio_items.append(
            VirtualInvestmentPublic(
                id=inv.id,
                startup_profile_id=inv.startup_profile_id,
                startup_name=name,
                industry=ind,
                amount=float(inv.amount),
                current_value=current_val,
                return_percent=ret_pct,
                created_at=inv.created_at,
            )
        )

    overall_return = ((current_portfolio_value - total_invested) / total_invested * 100.0) if total_invested > 0 else 0.0

    return FantasyPortfolioResponse(
        available_credits=available_credits,
        total_invested=total_invested,
        current_portfolio_value=current_portfolio_value,
        net_return_percent=overall_return,
        investments=portfolio_items,
    )


@router.post("/portfolio/invest", status_code=status.HTTP_201_CREATED)
def make_virtual_investment(
    payload: VirtualInvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.virtual_investment import VirtualInvestment

    sp = db.execute(select(StartupProfile).where(StartupProfile.id == payload.startup_profile_id)).scalar_one_or_none()
    if not sp:
        raise HTTPException(status_code=404, detail="Startup profile not found")

    existing = db.execute(
        select(VirtualInvestment).where(
            VirtualInvestment.user_id == current_user.id,
            VirtualInvestment.startup_profile_id == payload.startup_profile_id,
        )
    ).scalar_one_or_none()

    if existing:
        existing.amount = float(existing.amount) + payload.amount
        db.commit()
        db.refresh(existing)
        return {"message": f"Added ₹{payload.amount:,.0f} virtual credits to {sp.startup_name}!"}
    else:
        new_inv = VirtualInvestment(
            user_id=current_user.id,
            startup_profile_id=payload.startup_profile_id,
            amount=payload.amount,
        )
        db.add(new_inv)
        db.commit()
        return {"message": f"Invested ₹{payload.amount:,.0f} virtual credits in {sp.startup_name}!"}

