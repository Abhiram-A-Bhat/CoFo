from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.messaging import (
    ConversationCreate,
    ConversationListResponse,
    ConversationPublic,
    MessageCreate,
    MessageListResponse,
    MessagePublic,
)
from app.services.messaging import (
    get_or_create_conversation,
    list_conversation_messages,
    list_my_conversations,
    mark_my_conversation_read,
    send_conversation_message,
)
from app.websockets.manager import conversation_connection_manager

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=ConversationListResponse)
def list_conversations(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ConversationListResponse:
    return list_my_conversations(db, current_user)


@router.post("", response_model=ConversationPublic)
def create_conversation(
    payload: ConversationCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ConversationPublic:
    return get_or_create_conversation(db, user=current_user, payload=payload)


@router.get("/{conversation_id}/messages", response_model=MessageListResponse)
def list_messages(
    conversation_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> MessageListResponse:
    return list_conversation_messages(
        db,
        user=current_user,
        conversation_id=conversation_id,
        limit=limit,
        offset=offset,
    )


@router.post("/{conversation_id}/messages", response_model=MessagePublic)
async def send_message(
    conversation_id: UUID,
    payload: MessageCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> MessagePublic:
    message = send_conversation_message(
        db,
        user=current_user,
        conversation_id=conversation_id,
        payload=payload,
    )
    await conversation_connection_manager.broadcast(
        conversation_id,
        {
            "type": "message",
            "message": {
                "id": str(message.id),
                "conversation_id": str(message.conversation_id),
                "sender_id": str(message.sender_id),
                "body": message.body,
                "read_at": message.read_at.isoformat() if message.read_at else None,
                "created_at": message.created_at.isoformat(),
            },
        },
    )
    return message


@router.post("/{conversation_id}/read", response_model=ConversationPublic)
async def mark_read(
    conversation_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> ConversationPublic:
    conversation = mark_my_conversation_read(
        db,
        user=current_user,
        conversation_id=conversation_id,
    )
    await conversation_connection_manager.broadcast(
        conversation_id,
        {
            "type": "read",
            "conversation_id": str(conversation_id),
            "reader_id": str(current_user.id),
        },
    )
    return conversation
