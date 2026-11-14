"""
Alivio AI Infrastructure - Evidence Validation Schemas
Defines request contracts, internal Gemini response schemas, and final HTTP response models.
"""

from pydantic import BaseModel, Field, ConfigDict
from schemas.enums import ValidationModeEnum, RejectionReasonEnum


class EvidenceValidationRequest(BaseModel):
    """Incoming request payload from Node.js Gateway for Stage 1 validation."""
    model_config = ConfigDict(extra="forbid")

    text: str = Field(
        ...,
        min_length=5,
        max_length=2000,
        description="Complaint text or repair ticket description",
    )
    imageBase64: str = Field(
        ...,
        min_length=20,
        description="Base64-encoded image string directly from RAM buffer",
    )
    mode: ValidationModeEnum = Field(
        default=ValidationModeEnum.STUDENT_INTAKE,
        description="Validation mode: student_intake or staff_resolution",
    )


class GeminiVerificationResult(BaseModel):
    """
    Internal structured output schema passed to Gemini's response_schema.
    Excludes processingTimeMs because the LLM does not measure its own execution time.
    """
    model_config = ConfigDict(extra="forbid")

    isValid: bool = Field(
        ...,
        description="True if image plausibly matches complaint context and is not prank/degraded",
    )
    rejectionReason: RejectionReasonEnum = Field(
        ...,
        description="Rejection classification enum (must be VALID if isValid is True)",
    )
    detectedScene: str = Field(
        ...,
        min_length=3,
        max_length=300,
        description="Objective factual description of what is visible in the photo",
    )
    consistencyScore: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Semantic consistency between image and description (0.0 to 1.0)",
    )
    userFeedback: str = Field(
        ...,
        min_length=5,
        max_length=500,
        description="Constructive explanation for the user",
    )


class EvidenceValidationResponse(BaseModel):
    """Final HTTP response returned to the Node.js Gateway."""
    model_config = ConfigDict(extra="forbid")

    isValid: bool
    rejectionReason: RejectionReasonEnum
    detectedScene: str
    consistencyScore: float
    userFeedback: str
    processingTimeMs: float = Field(..., description="Measured latency in milliseconds")
