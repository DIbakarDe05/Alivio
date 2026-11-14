"""
Alivio AI Infrastructure - Stage 2 Multimodal Triage Router
Exposes POST /api/v1/analyze and attaches X-AI-Outcome metadata headers.
"""

from fastapi import APIRouter, Request, Response, status
from schemas.analyze import AnalyzeRequest, AnalyzeResponse
from services.gemini_triage import gemini_triage_service

router = APIRouter(prefix="/api/v1", tags=["Multimodal Triage"])


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Stage 2: Multimodal Triage & Semantic Deduplication Engine",
)
async def analyze_complaint(
    req: AnalyzeRequest,
    raw_request: Request,
    response: Response,
) -> AnalyzeResponse:
    """
    Performs 10-category taxonomic classification, 80/20 severity scoring,
    and in-memory semantic duplicate matching against nearby active tickets.
    Guarantees safe manual-review fallback on timeout or error (zero HTTP 500s).
    """
    http_client = getattr(raw_request.app.state, "http_client", None)
    res_data, outcome, fallback_reason = await gemini_triage_service.analyze_complaint(
        req, http_client=http_client
    )

    response.headers["X-AI-Outcome"] = outcome.value
    response.headers["X-AI-Fallback-Reason"] = fallback_reason.value

    return res_data
