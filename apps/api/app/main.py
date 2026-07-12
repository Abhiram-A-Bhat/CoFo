from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.api.v1.router import api_router
from app.api.v1.messaging_ws import router as messaging_ws_router
from app.core.config import settings
from app.db.base import Base
import app.models
from app.db.session import engine

import sys
import traceback
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

app = FastAPI(title="FundFlow AI API")

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    print(f"DEBUG: StarletteHTTPException caught! status_code={exc.status_code}, detail={exc.detail}", file=sys.stderr)
    return Response(content=str(exc.detail), status_code=exc.status_code)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"DEBUG: RequestValidationError caught! errors={exc.errors()}", file=sys.stderr)
    return Response(content=str(exc.errors()), status_code=400)

@app.exception_handler(Exception)
async def universal_exception_handler(request: Request, exc: Exception):
    print(f"DEBUG: Unhandled exception caught! {exc}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    return Response(content="Internal Server Error", status_code=500)



@app.on_event("startup")
def on_startup():
    # Ensure all tables are created (including in production PostgreSQL)
    Base.metadata.create_all(bind=engine)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault(
            "Permissions-Policy",
            "camera=(), microphone=(), geolocation=(), payment=()",
        )
        response.headers.setdefault(
            "Content-Security-Policy",
            "default-src 'self'; frame-ancestors 'none'; base-uri 'self'",
        )
        if request.url.scheme == "https":
            response.headers.setdefault(
                "Strict-Transport-Security",
                "max-age=31536000; includeSubDomains",
            )
        return response


app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)
app.include_router(messaging_ws_router, prefix=settings.api_v1_prefix)

Path(settings.media_root).mkdir(parents=True, exist_ok=True)
app.mount(
    settings.public_media_path,
    StaticFiles(directory=settings.media_root),
    name="media",
)


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
