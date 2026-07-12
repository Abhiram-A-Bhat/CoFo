from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from jose import JWTError

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.repositories.users import get_user_by_id
from app.schemas.messaging import MessageCreate
from app.services.messaging import (
    get_participating_conversation,
    mark_my_conversation_read,
    send_conversation_message,
)
from app.websockets.manager import conversation_connection_manager

router = APIRouter(tags=["conversation-websockets"])


@router.websocket("/ws/conversations/{conversation_id}")
async def conversation_websocket(websocket: WebSocket, conversation_id: UUID) -> None:
    db = SessionLocal()
    user = None

    try:
        token = websocket.cookies.get(settings.auth_cookie_name) or websocket.query_params.get(
            "access_token"
        )
        if not token:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        try:
            payload = decode_access_token(token)
            subject = payload.get("sub")
            if not subject:
                raise ValueError("Malformed token")
            user = get_user_by_id(db, UUID(subject))
        except (JWTError, TypeError, ValueError):
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        if user is None or not user.is_active:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        try:
            get_participating_conversation(db, user=user, conversation_id=conversation_id)
        except Exception:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        await conversation_connection_manager.connect(conversation_id, websocket)
        mark_my_conversation_read(db, user=user, conversation_id=conversation_id)
        await conversation_connection_manager.broadcast(
            conversation_id,
            {"type": "read", "conversation_id": str(conversation_id), "reader_id": str(user.id)},
        )

        while True:
            payload = await websocket.receive_json()
            body = str(payload.get("body", "")).strip()
            if not body:
                continue

            message = send_conversation_message(
                db,
                user=user,
                conversation_id=conversation_id,
                payload=MessageCreate(body=body),
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
    except WebSocketDisconnect:
        pass
    finally:
        if user is not None:
            conversation_connection_manager.disconnect(conversation_id, websocket)
        db.close()
