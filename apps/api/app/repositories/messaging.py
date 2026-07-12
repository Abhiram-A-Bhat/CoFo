from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User


def normalize_participant_pair(left_user_id: UUID, right_user_id: UUID) -> tuple[UUID, UUID]:
    return tuple(sorted((left_user_id, right_user_id), key=str))  # type: ignore[return-value]


def get_conversation_by_id(
    db: Session,
    conversation_id: UUID,
) -> Conversation | None:
    return db.get(Conversation, conversation_id)


def get_conversation_for_participants(
    db: Session,
    *,
    left_user_id: UUID,
    right_user_id: UUID,
) -> Conversation | None:
    participant_one_id, participant_two_id = normalize_participant_pair(
        left_user_id,
        right_user_id,
    )
    statement = select(Conversation).where(
        Conversation.participant_one_id == participant_one_id,
        Conversation.participant_two_id == participant_two_id,
    )
    return db.scalar(statement)


def create_conversation(
    db: Session,
    *,
    left_user_id: UUID,
    right_user_id: UUID,
) -> Conversation:
    participant_one_id, participant_two_id = normalize_participant_pair(
        left_user_id,
        right_user_id,
    )
    conversation = Conversation(
        participant_one_id=participant_one_id,
        participant_two_id=participant_two_id,
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def list_conversations_for_user(db: Session, user_id: UUID) -> list[Conversation]:
    statement = (
        select(Conversation)
        .where(
            or_(
                Conversation.participant_one_id == user_id,
                Conversation.participant_two_id == user_id,
            )
        )
        .order_by(Conversation.updated_at.desc())
    )
    return list(db.scalars(statement).all())


def create_message(
    db: Session,
    *,
    conversation: Conversation,
    sender_id: UUID,
    body: str,
) -> Message:
    message = Message(
        conversation_id=conversation.id,
        sender_id=sender_id,
        body=body.strip(),
    )
    conversation.updated_at = datetime.now(timezone.utc)
    db.add(message)
    db.commit()
    db.refresh(message)
    db.refresh(conversation)
    return message


def list_messages_for_conversation(
    db: Session,
    conversation_id: UUID,
    *,
    limit: int,
    offset: int,
) -> list[Message]:
    statement = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
        .offset(offset)
    )
    return list(db.scalars(statement).all())


def get_last_message(db: Session, conversation_id: UUID) -> Message | None:
    statement = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(1)
    )
    return db.scalar(statement)


def count_unread_messages(
    db: Session,
    *,
    conversation_id: UUID,
    user_id: UUID,
) -> int:
    statement = select(func.count()).select_from(Message).where(
        Message.conversation_id == conversation_id,
        Message.sender_id != user_id,
        Message.read_at.is_(None),
    )
    return db.scalar(statement) or 0


def mark_conversation_read(
    db: Session,
    *,
    conversation_id: UUID,
    user_id: UUID,
) -> None:
    messages = db.scalars(
        select(Message).where(
            Message.conversation_id == conversation_id,
            Message.sender_id != user_id,
            Message.read_at.is_(None),
        )
    ).all()
    read_at = datetime.now(timezone.utc)
    for message in messages:
        message.read_at = read_at
    db.commit()


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    return db.get(User, user_id)


def user_participates(conversation: Conversation, user_id: UUID) -> bool:
    return user_id in {conversation.participant_one_id, conversation.participant_two_id}


def other_participant_id(conversation: Conversation, user_id: UUID) -> UUID:
    if conversation.participant_one_id == user_id:
        return conversation.participant_two_id
    return conversation.participant_one_id
