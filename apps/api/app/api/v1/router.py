from fastapi import APIRouter

from app.api.v1.admin import router as admin_router
from app.api.v1.auth import router as auth_router
from app.api.v1.investor_discovery import router as investor_discovery_router
from app.api.v1.investor_profiles import router as investor_profiles_router
from app.api.v1.matching import router as matching_router
from app.api.v1.messaging import router as messaging_router
from app.api.v1.pitch_feed import router as pitch_feed_router
from app.api.v1.profile_verifications import router as profile_verifications_router
from app.api.v1.startup_discovery import router as startup_discovery_router
from app.api.v1.startup_profiles import router as startup_profiles_router
from app.api.v1.retention import router as retention_router

api_router = APIRouter()
api_router.include_router(admin_router)
api_router.include_router(auth_router)
api_router.include_router(investor_discovery_router)
api_router.include_router(investor_profiles_router)
api_router.include_router(matching_router)
api_router.include_router(messaging_router)
api_router.include_router(pitch_feed_router)
api_router.include_router(profile_verifications_router)
api_router.include_router(startup_discovery_router)
api_router.include_router(startup_profiles_router)
api_router.include_router(retention_router)
