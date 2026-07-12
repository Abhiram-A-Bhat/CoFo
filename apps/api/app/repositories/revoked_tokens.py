from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.revoked_token import RevokedToken


def is_token_revoked(db: Session, jti: str) -> bool:
    statement = select(RevokedToken.id).where(RevokedToken.jti == jti)
    return db.scalar(statement) is not None


def revoke_token(
    db: Session,
    *,
    jti: str,
    user_id: UUID,
    expires_at: datetime,
) -> RevokedToken:
    revoked_token = RevokedToken(jti=jti, user_id=user_id, expires_at=expires_at)
    db.add(revoked_token)
    db.commit()
    db.refresh(revoked_token)
    return revoked_token
