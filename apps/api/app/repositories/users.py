from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_email(db: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email.lower())
    return db.scalar(statement)


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    statement = select(User).where(User.id == user_id)
    return db.scalar(statement)


def create_user(
    db: Session,
    *,
    email: str,
    hashed_password: str,
    full_name: str | None,
    role: str,
    investment_interests: list[str] | None = None,
) -> User:
    user = User(
        email=email.lower(),
        hashed_password=hashed_password,
        full_name=full_name,
        role=role,
        investment_interests=investment_interests or [],
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
