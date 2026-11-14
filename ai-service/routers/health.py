"""
Alivio AI Infrastructure - Health Check Router
Exposes GET /api/v1/health. Zero Gemini API calls (zero quota cost).
"""

from fastapi import APIRouter, status
from pydantic import BaseModel, ConfigDict
from config import settings
from services.key_manager import key_manager

router = APIRouter(prefix="/api/v1", tags=["Health & Observability"])


class HealthResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: str
    service: str
    model: str
    sdk: str
    activeKeysInPool: int
    version: str


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Zero-Cost Service Health & Pool Readiness Check",
)
async def check_health() -> HealthResponse:
    """
    Returns immediate service health and number of active keys in pool.
    Consumes zero Gemini tokens or API calls.
    """
    return HealthResponse(
        status="healthy",
        service="alivio-ai-service",
        model=settings.MODEL_NAME,
        sdk="google-genai",
        activeKeysInPool=key_manager.get_active_keys_count(),
        version=settings.PROMPT_VERSION,
    )
