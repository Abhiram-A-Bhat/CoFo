from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, Uuid, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class InvestorUpdate(Base):
    __tablename__ = "investor_updates"

    id: Mapped[UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid4,
    )
    startup_profile_id: Mapped[UUID] = mapped_column(
        Uuid,
        ForeignKey("startup_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    month_year: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. "July 2026"
    mrr: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    runway_months: Mapped[int | None] = mapped_column(nullable=True)
    highlights: Mapped[str] = mapped_column(Text, nullable=False)
    lowlights: Mapped[str | None] = mapped_column(Text, nullable=True)
    asks: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
