from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ConversationCreate(BaseModel):
    participant_user_id: UUID


class MessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=5000)


class MessagePublic(BaseModel):
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    body: str
    read_at: datetime | None
    created_at: datetime


class ConversationPublic(BaseModel):
    id: UUID
    participant_user_id: UUID
    participant_name: str | None
    participant_email: str
    unread_count: int
    last_message: MessagePublic | None
    created_at: datetime
    updated_at: datetime


class ConversationListResponse(BaseModel):
    items: list[ConversationPublic]


class MessageListResponse(BaseModel):
    items: list[MessagePublic]
