"""
Alivio AI Infrastructure - Multimodal Triage & Deduplication Schemas
Defines request contracts, internal Gemini structured triage models, and final HTTP response models.
"""

from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from schemas.enums import CategoryEnum, DepartmentEnum, PriorityEnum


class NearbyTicketCandidate(BaseModel):
    """Candidate master ticket found within 75m and 72h by Node.js MongoDB geo-query."""
    model_config = ConfigDict(extra="forbid")

    ticketId: str = Field(..., min_length=1, max_length=64, description="Unique ticket identifier")
    category: CategoryEnum = Field(..., description="Category of existing ticket")
    summary: str = Field(..., min_length=3, max_length=200, description="Summary of existing ticket")


class DeduplicationDecision(BaseModel):
    """Structured deduplication decision produced during triage."""
    model_config = ConfigDict(extra="forbid")

    isDuplicate: bool = Field(
        ...,
        description="True if current complaint describes the exact same issue as an existing candidate",
    )
    duplicateOfTicketId: Optional[str] = Field(
        default=None,
        max_length=64,
        description="Ticket ID of the matched master ticket (must be in recentNearbyTickets)",
    )
    similarityScore: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Semantic similarity score between reports (0.0 to 1.0)",
    )
    matchReason: Optional[str] = Field(
        default=None,
        max_length=300,
        description="Brief justification for why these tickets are duplicates or distinct",
    )


class AnalyzeRequest(BaseModel):
    """Incoming request for Stage 2 multimodal triage and semantic deduplication."""
    model_config = ConfigDict(extra="forbid")

    text: str = Field(
        ...,
        min_length=5,
        max_length=2000,
        description="Complaint text description",
    )
    imageBase64: Optional[str] = Field(
        default=None,
        description="Optional Base64-encoded image string directly from RAM buffer",
    )
    imageUrl: Optional[str] = Field(
        default=None,
        description="Optional HTTPS Cloudinary URL fallback for historical re-analysis",
    )
    recentNearbyTickets: Optional[List[NearbyTicketCandidate]] = Field(
        default_factory=list,
        max_length=10,
        description="Up to 10 active nearby master tickets within 75m and last 72 hours",
    )


class GeminiTriageResult(BaseModel):
    """
    Internal structured output schema passed to Gemini's response_schema.
    Excludes processingTimeMs because the LLM does not measure its own execution time.
    """
    model_config = ConfigDict(extra="forbid")

    category: CategoryEnum = Field(..., description="10-category taxonomy classification")
    priority: PriorityEnum = Field(..., description="Urgency level: HIGH, MEDIUM, or LOW")
    severityScore: int = Field(
        ...,
        ge=0,
        le=100,
        description="Intrinsic defect severity score (0-100, 80% weight in priority model)",
    )
    department: DepartmentEnum = Field(..., description="Target maintenance department")
    summary: str = Field(
        ...,
        min_length=3,
        max_length=150,
        description="Concise description at most 15 words",
    )
    reason: str = Field(
        ...,
        min_length=5,
        max_length=400,
        description="Technical justification for category, severity, and priority",
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence level of classification (0.0 to 1.0)",
    )
    deduplication: DeduplicationDecision = Field(
        ...,
        description="Semantic duplicate matching decision against nearby candidate tickets",
    )


class AnalyzeResponse(BaseModel):
    """Final HTTP response returned to the Node.js Gateway."""
    model_config = ConfigDict(extra="forbid")

    category: CategoryEnum
    priority: PriorityEnum
    severityScore: int
    department: DepartmentEnum
    summary: str
    reason: str
    confidence: float
    deduplication: DeduplicationDecision
    processingTimeMs: float = Field(..., description="Measured latency in milliseconds")
