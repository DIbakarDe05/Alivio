"""
Alivio AI Infrastructure - Stage 2 Multimodal Triage & Deduplication Service
Handles complaint categorization, 80/20 severity scoring, semantic deduplication,
and deterministic post-processing. Enforces temperature=0.1 and safe manual-review fallback.
"""

import time
from typing import Dict, Tuple, Optional
import httpx
from google.genai import types

from config import settings
from schemas.enums import (
    CategoryEnum,
    DepartmentEnum,
    PriorityEnum,
    AIOutcomeEnum,
    AIFallbackReasonEnum,
)
from schemas.analyze import (
    AnalyzeRequest,
    DeduplicationDecision,
    GeminiTriageResult,
    AnalyzeResponse,
)
from services.key_manager import key_manager, PoolType
from prompts.classify import CLASSIFY_SYSTEM_PROMPT, build_triage_prompt
from utils.image import sanitize_and_decode_base64_image, fetch_ssrf_safe_image
from utils.logger import logger

# Strict category-to-department deterministic mapping table
CATEGORY_TO_DEPARTMENT_MAP: Dict[CategoryEnum, DepartmentEnum] = {
    CategoryEnum.ELECTRICAL: DepartmentEnum.ELECTRICAL,
    CategoryEnum.PLUMBING: DepartmentEnum.PLUMBING,
    CategoryEnum.CIVIL: DepartmentEnum.CIVIL,
    CategoryEnum.SANITATION: DepartmentEnum.SANITATION,
    CategoryEnum.HVAC: DepartmentEnum.HVAC,
    CategoryEnum.IT_NETWORK: DepartmentEnum.IT_NETWORK,
    CategoryEnum.HOSTEL: DepartmentEnum.HOSTEL,
    CategoryEnum.ROADS_LIGHTING: DepartmentEnum.ROADS_LIGHTING,
    CategoryEnum.SAFETY_SECURITY: DepartmentEnum.SAFETY_SECURITY,
    CategoryEnum.OTHER: DepartmentEnum.OTHER,
}


class GeminiTriageService:
    """Service encapsulating Stage 2 triage and deduplication logic."""

    async def analyze_complaint(
        self,
        request: AnalyzeRequest,
        http_client: Optional[httpx.AsyncClient] = None,
    ) -> Tuple[AnalyzeResponse, AIOutcomeEnum, AIFallbackReasonEnum]:
        """
        Executes multimodal triage and semantic deduplication.
        If Gemini times out or errors, returns safe deterministic fallback for manual admin review.
        """
        start_time = time.perf_counter()

        image_bytes: Optional[bytes] = None
        mime_type: Optional[str] = None

        # Resolve image: Base64 takes precedence over imageUrl
        if request.imageBase64:
            image_bytes, mime_type = sanitize_and_decode_base64_image(request.imageBase64)
        elif request.imageUrl and http_client:
            image_bytes, mime_type = await fetch_ssrf_safe_image(request.imageUrl, http_client)

        user_prompt = build_triage_prompt(request.text, request.recentNearbyTickets)
        contents = [user_prompt]
        if image_bytes and mime_type:
            contents.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_type))

        config = types.GenerateContentConfig(
            system_instruction=CLASSIFY_SYSTEM_PROMPT,
            temperature=0.1,
            response_mime_type="application/json",
            response_schema=GeminiTriageResult,
        )

        try:
            raw_response, outcome_type = await key_manager.execute_with_failover(
                primary_pool=PoolType.TRIAGE,
                contents=contents,
                config=config,
            )

            result = GeminiTriageResult.model_validate_json(raw_response.text)

            # Rule 1: Always overwrite department deterministically via lookup table
            correct_department = CATEGORY_TO_DEPARTMENT_MAP.get(
                result.category, DepartmentEnum.OTHER
            )

            # Rule 2: 15-word summary enforcement
            summary_words = result.summary.strip().split()
            if len(summary_words) > 15:
                cleaned_summary = " ".join(summary_words[:15])
            else:
                cleaned_summary = result.summary.strip()

            # Rule 3: Severity-to-priority band consistency clamping
            severity = result.severityScore
            if result.priority == PriorityEnum.HIGH:
                severity = max(85, severity)
            elif result.priority == PriorityEnum.MEDIUM:
                severity = min(80, max(45, severity))
            elif result.priority == PriorityEnum.LOW:
                severity = min(40, severity)

            # Rule 4: Deduplication referential integrity guard (anti-hallucination)
            valid_candidate_ids = (
                {c.ticketId for c in request.recentNearbyTickets}
                if request.recentNearbyTickets
                else set()
            )

            dedup = result.deduplication
            if (
                not request.recentNearbyTickets
                or not dedup.isDuplicate
                or dedup.duplicateOfTicketId not in valid_candidate_ids
                or dedup.similarityScore < 0.75
            ):
                dedup.isDuplicate = False
                dedup.duplicateOfTicketId = None
                dedup.matchReason = None
                if not request.recentNearbyTickets:
                    dedup.similarityScore = 0.0

            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            response = AnalyzeResponse(
                category=result.category,
                priority=result.priority,
                severityScore=severity,
                department=correct_department,
                summary=cleaned_summary,
                reason=result.reason,
                confidence=result.confidence,
                deduplication=dedup,
                processingTimeMs=elapsed_ms,
            )
            return response, AIOutcomeEnum.MODEL, AIFallbackReasonEnum.NONE

        except Exception as exc:
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            exc_str = str(exc).lower()
            logger.warning(
                f"Stage 2 triage failed ({type(exc).__name__}: {str(exc)}). Triggering SAFE MANUAL-REVIEW fallback."
            )

            fallback_reason = AIFallbackReasonEnum.TIMEOUT
            if "429" in exc_str or "quota" in exc_str or "resource_exhausted" in exc_str:
                fallback_reason = AIFallbackReasonEnum.QUOTA_EXHAUSTED
            elif "503" in exc_str or "unavailable" in exc_str or "connection" in exc_str:
                fallback_reason = AIFallbackReasonEnum.PROVIDER_UNAVAILABLE

            # Deterministic Safe Fallback Payload as per Section 7.3
            fallback_response = AnalyzeResponse(
                category=CategoryEnum.OTHER,
                priority=PriorityEnum.MEDIUM,
                severityScore=50,
                department=DepartmentEnum.OTHER,
                summary="Complaint queued for manual administrator review.",
                reason="Automated AI triage timed out or was unavailable; routed for manual triage.",
                confidence=0.0,
                deduplication=DeduplicationDecision(
                    isDuplicate=False,
                    duplicateOfTicketId=None,
                    similarityScore=0.0,
                    matchReason=None,
                ),
                processingTimeMs=elapsed_ms,
            )
            return fallback_response, AIOutcomeEnum.FALLBACK, fallback_reason


gemini_triage_service = GeminiTriageService()
