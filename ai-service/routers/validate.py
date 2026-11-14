"""
Alivio AI Infrastructure - Stage 1 Evidence Validation Router
Exposes POST /api/v1/validate-evidence and attaches X-AI-Outcome metadata headers.
"""

from fastapi import APIRouter, Response, status
from schemas.validation import EvidenceValidationRequest, EvidenceValidationResponse
from services.image_verifier import image_verifier_service

router = APIRouter(prefix="/api/v1", tags=["Evidence Validation"])


@router.post(
    "/validate-evidence",
    response_model=EvidenceValidationResponse,
    status_code=status.HTTP_200_OK,
    summary="Stage 1: Bidirectional Visual Evidence Gatekeeper",
)
async def validate_evidence(
    request: EvidenceValidationRequest,
    response: Response,
) -> EvidenceValidationResponse:
    """
    Evaluates whether an uploaded photo plausibly depicts the reported defect (student_intake)
    or completed repair (staff_resolution) before Cloudinary upload.
    Enforces Fail-Open resilience on timeouts or upstream Gemini outages.
    """
    res_data, outcome, fallback_reason = await image_verifier_service.verify_evidence(request)

    response.headers["X-AI-Outcome"] = outcome.value
    response.headers["X-AI-Fallback-Reason"] = fallback_reason.value

    return res_data
