from collections import defaultdict
from uuid import UUID

from fastapi import WebSocket


class ConversationConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[UUID, set[WebSocket]] = defaultdict(set)

    async def connect(self, conversation_id: UUID, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections[conversation_id].add(websocket)

    def disconnect(self, conversation_id: UUID, websocket: WebSocket) -> None:
        self._connections[conversation_id].discard(websocket)
        if not self._connections[conversation_id]:
            del self._connections[conversation_id]

    async def broadcast(self, conversation_id: UUID, payload: dict) -> None:
        stale_connections: list[WebSocket] = []
        for websocket in self._connections.get(conversation_id, set()):
            try:
                await websocket.send_json(payload)
            except RuntimeError:
                stale_connections.append(websocket)

        for websocket in stale_connections:
            self.disconnect(conversation_id, websocket)


conversation_connection_manager = ConversationConnectionManager()
