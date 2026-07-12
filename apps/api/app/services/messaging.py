from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.repositories import messaging as messaging_repository
from app.schemas.messaging import (
    ConversationCreate,
    ConversationListResponse,
    ConversationPublic,
    MessageCreate,
    MessageListResponse,
    MessagePublic,
)


def list_my_conversations(db: Session, user: User) -> ConversationListResponse:
    conversations = messaging_repository.list_conversations_for_user(db, user.id)
    return ConversationListResponse(
        items=[serialize_conversation(db, conversation, user.id) for conversation in conversations]
    )


def get_or_create_conversation(
    db: Session,
    *,
    user: User,
    payload: ConversationCreate,
) -> ConversationPublic:
    if payload.participant_user_id == user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create a conversation with yourself.",
        )

    participant = messaging_repository.get_user_by_id(db, payload.participant_user_id)
    if participant is None or not participant.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found.",
        )

    conversation = messaging_repository.get_conversation_for_participants(
        db,
        left_user_id=user.id,
        right_user_id=payload.participant_user_id,
    )
    if conversation is None:
        try:
            conversation = messaging_repository.create_conversation(
                db,
                left_user_id=user.id,
                right_user_id=payload.participant_user_id,
            )
        except IntegrityError:
            db.rollback()
            conversation = messaging_repository.get_conversation_for_participants(
                db,
                left_user_id=user.id,
                right_user_id=payload.participant_user_id,
            )

    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create conversation.",
        )

    return serialize_conversation(db, conversation, user.id)


def list_conversation_messages(
    db: Session,
    *,
    user: User,
    conversation_id: UUID,
    limit: int,
    offset: int,
) -> MessageListResponse:
    conversation = get_participating_conversation(db, user=user, conversation_id=conversation_id)
    messages = messaging_repository.list_messages_for_conversation(
        db,
        conversation.id,
        limit=limit,
        offset=offset,
    )
    return MessageListResponse(items=[serialize_message(message) for message in messages])


def send_conversation_message(
    db: Session,
    *,
    user: User,
    conversation_id: UUID,
    payload: MessageCreate,
) -> MessagePublic:
    conversation = get_participating_conversation(db, user=user, conversation_id=conversation_id)
    message = messaging_repository.create_message(
        db,
        conversation=conversation,
        sender_id=user.id,
        body=payload.body,
    )
    return serialize_message(message)


def mark_my_conversation_read(
    db: Session,
    *,
    user: User,
    conversation_id: UUID,
) -> ConversationPublic:
    conversation = get_participating_conversation(db, user=user, conversation_id=conversation_id)
    messaging_repository.mark_conversation_read(
        db,
        conversation_id=conversation.id,
        user_id=user.id,
    )
    return serialize_conversation(db, conversation, user.id)


def get_participating_conversation(
    db: Session,
    *,
    user: User,
    conversation_id: UUID,
) -> Conversation:
    conversation = messaging_repository.get_conversation_by_id(db, conversation_id)
    if conversation is None or not messaging_repository.user_participates(conversation, user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )
    return conversation


def serialize_conversation(
    db: Session,
    conversation: Conversation,
    current_user_id: UUID,
) -> ConversationPublic:
    participant_id = messaging_repository.other_participant_id(conversation, current_user_id)
    participant = messaging_repository.get_user_by_id(db, participant_id)
    last_message = messaging_repository.get_last_message(db, conversation.id)
    return ConversationPublic(
        id=conversation.id,
        participant_user_id=participant_id,
        participant_name=participant.full_name if participant else None,
        participant_email=participant.email if participant else "Unknown user",
        unread_count=messaging_repository.count_unread_messages(
            db,
            conversation_id=conversation.id,
            user_id=current_user_id,
        ),
        last_message=serialize_message(last_message) if last_message else None,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
    )


def serialize_message(message: Message) -> MessagePublic:
    return MessagePublic(
        id=message.id,
        conversation_id=message.conversation_id,
        sender_id=message.sender_id,
        body=message.body,
        read_at=message.read_at,
        created_at=message.created_at,
    )
