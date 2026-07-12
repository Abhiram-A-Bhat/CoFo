from collections import defaultdict, deque
from time import monotonic
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status


class InMemoryRateLimiter:
    def __init__(self, *, limit: int, window_seconds: int) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self._events: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str) -> None:
        now = monotonic()
        events = self._events[key]

        while events and now - events[0] > self.window_seconds:
            events.popleft()

        if len(events) >= self.limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )

        events.append(now)


auth_rate_limiter = InMemoryRateLimiter(limit=10, window_seconds=60)


def rate_limit_auth(request: Request) -> None:
    client_host = request.client.host if request.client else "unknown"
    auth_rate_limiter.check(f"auth:{client_host}")


AuthRateLimit = Annotated[None, Depends(rate_limit_auth)]
