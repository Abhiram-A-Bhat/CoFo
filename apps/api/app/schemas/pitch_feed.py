from pydantic import BaseModel

from app.schemas.startup_discovery import StartupDiscoveryItem


class PitchFeedResponse(BaseModel):
    items: list[StartupDiscoveryItem]
    total: int
    limit: int
    offset: int
