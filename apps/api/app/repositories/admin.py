from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def list_users(db: Session) -> list[User]:
    statement = select(User).order_by(User.created_at.desc())
    return list(db.scalars(statement).all())
