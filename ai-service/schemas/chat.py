"""
Alivio AI Infrastructure - Helpdesk Assistant Chat Schemas
Defines request contracts, internal Gemini chat models, and final HTTP response models.
"""

from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict, model_validator
from schemas.enums import CategoryEnum, PriorityEnum


class ChatMessage(BaseModel):
    """Single turn in conversational history."""
    model_config = ConfigDict(extra="forbid")

    role: Literal["user", "assistant"] = Field(..., description="Message author role")
    content: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Text content of the message",
    )


class TicketContext(BaseModel):
    """Contextual ticket details authorized and injected by the Node.js Gateway."""
    model_config = ConfigDict(extra="forbid")

    ticketId: str = Field(..., max_length=64)
    title: str = Field(..., max_length=200)
    category: CategoryEnum
    priority: PriorityEnum
    status: str = Field(..., max_length=50)
    locationDescription: str = Field(..., max_length=300)
    assignedStaff: Optional[str] = Field(default=None, max_length=150)
    slaDeadline: Optional[str] = Field(default=None, max_length=100)


class ChatRequest(BaseModel):
    """Incoming request for Stage 3 helpdesk chat."""
    model_config = ConfigDict(extra="forbid")

    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Latest user message",
    )
    ticketId: Optional[str] = Field(
        default=None,
        max_length=64,
        description="Optional ticket ID to query",
    )
    ticketData: Optional[TicketContext] = Field(
        default=None,
        description="Optional detailed ticket record from database",
    )
    conversationHistory: Optional[List[ChatMessage]] = Field(
        default_factory=list,
        max_length=100,
        description="Prior conversation turns (truncated to last 10 internally)",
    )

    @model_validator(mode="after")
    def validate_ticket_consistency(self) -> "ChatRequest":
        """Ensures ticketId and ticketData.ticketId do not conflict if both provided."""
        if self.ticketId and self.ticketData and self.ticketId != self.ticketData.ticketId:
            raise ValueError(
                f"ticketId '{self.ticketId}' conflicts with ticketData.ticketId '{self.ticketData.ticketId}'"
            )
        return self


class GeminiChatResult(BaseModel):
    """
    Internal structured output schema passed to Gemini's response_schema.
    Excludes processingTimeMs because the LLM does not measure its own execution time.
    """
    model_config = ConfigDict(extra="forbid")

    reply: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Grounded, helpful markdown response adhering to maintenance rules",
    )
    isInScope: bool = Field(
        ...,
        description="True if query pertains to campus maintenance/complaints/policies",
    )
    suggestedActions: List[str] = Field(
        default_factory=list,
        min_length=2,
        max_length=3,
        description="2 to 3 actionable quick-reply chips",
    )


class ChatResponse(BaseModel):
    """Final HTTP response returned to the Node.js Gateway."""
    model_config = ConfigDict(extra="forbid")

    reply: str
    isInScope: bool
    suggestedActions: List[str]
    processingTimeMs: float = Field(..., description="Measured latency in milliseconds")
