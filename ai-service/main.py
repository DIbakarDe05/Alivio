"""
Alivio AI Infrastructure - FastAPI Application Entry Point
Initializes lifespan client management, body-size enforcement middleware,
X-Request-ID correlation tracking, CORS, and registers all API routers.
"""

import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator
import httpx
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from utils.logger import logger, correlation_id_ctx
from services.key_manager import key_manager
from routers import validate_router, analyze_router, chat_router, health_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manages application startup and graceful shutdown."""
    logger.info(
        f"Starting Alivio AI Service (Model: {settings.MODEL_NAME}, Version: {settings.PROMPT_VERSION})..."
    )

    # Initialize reusable Gemini SDK clients for the 3-account pool
    key_manager.initialize()

    # Initialize reusable shared httpx.AsyncClient for allowlisted Cloudinary URL streaming
    app.state.http_client = httpx.AsyncClient(
        timeout=4.0,
        limits=httpx.Limits(max_keepalive_connections=10, max_connections=30),
    )

    yield

    # Graceful shutdown: close clients and release resources
    logger.info("Shutting down Alivio AI Service...")
    await app.state.http_client.aclose()
    key_manager.close()
    logger.info("Alivio AI Service shutdown complete.")


app = FastAPI(
    title="Alivio AI Infrastructure Microservice",
    description=(
        "Stateless Python 3.11 inference microservice powering visual evidence verification, "
        "multimodal complaint triage, semantic deduplication, and domain-restricted maintenance chat."
    ),
    version=settings.PROMPT_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-AI-Outcome", "X-AI-Fallback-Reason"],
)


# 2. X-Request-ID Correlation & Body-Limit Middleware
@app.middleware("http")
async def request_lifecycle_middleware(request: Request, call_next):
    # Establish Request Correlation ID
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    token = correlation_id_ctx.set(request_id)

    # Ingress Body Size Limit Enforcement (8 MiB Ceiling)
    content_length = request.headers.get("Content-Length")
    if content_length and int(content_length) > settings.MAX_REQUEST_BODY_BYTES:
        correlation_id_ctx.reset(token)
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={
                "detail": (
                    f"Request payload ({content_length} bytes) exceeds maximum ingress ceiling of "
                    f"{settings.MAX_REQUEST_BODY_BYTES} bytes (8 MiB)."
                ),
                "requestId": request_id,
            },
            headers={"X-Request-ID": request_id},
        )

    try:
        response: Response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
    finally:
        correlation_id_ctx.reset(token)


# 3. Global Unhandled Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    req_id = correlation_id_ctx.get() or "unknown"
    logger.error(
        f"Unhandled application exception on {request.method} {request.url.path}: {str(exc)}",
        exc_info=True,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred while processing the request.",
            "errorType": type(exc).__name__,
            "requestId": req_id,
        },
        headers={"X-Request-ID": req_id},
    )


# 4. Register API Routers
app.include_router(health_router)
app.include_router(validate_router)
app.include_router(analyze_router)
app.include_router(chat_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=False, workers=1)
