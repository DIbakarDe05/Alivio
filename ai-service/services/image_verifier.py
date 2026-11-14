"""
Alivio AI Infrastructure - Stage 1 Evidence Verification Service
Handles visual evidence validation for student_intake and staff_resolution modes.
Enforces temperature=0.0, response_schema=GeminiVerificationResult, and Fail-Open resilience.
"""

import time
from typing import Tuple
from google.genai import types

from config import settings
from schemas.enums import (
    ValidationModeEnum,
    RejectionReasonEnum,
    AIOutcomeEnum,
    AIFallbackReasonEnum,
)
from schemas.validation import (
    EvidenceValidationRequest,
    GeminiVerificationResult,
    EvidenceValidationResponse,
)
from services.key_manager import key_manager, PoolType
from prompts.verifier import VERIFIER_SYSTEM_PROMPT, build_verification_prompt
from utils.image import sanitize_and_decode_base64_image
from utils.logger import logger


class ImageVerifierService:
    """Service encapsulating Stage 1 evidence verification logic."""

    async def verify_evidence(
        self,
        request: EvidenceValidationRequest,
    ) -> Tuple[EvidenceValidationResponse, AIOutcomeEnum, AIFallbackReasonEnum]:
        """
        Executes evidence verification in RAM.
        If Gemini times out or quota is exhausted, fails open so users are never blocked.
        """
        start_time = time.perf_counter()

        # Step 1: Decode and validate image in RAM before spending any tokens
        image_bytes, mime_type = sanitize_and_decode_base64_image(request.imageBase64)

        # Step 2: Build prompts and GenAI configuration
        user_prompt = build_verification_prompt(request.text, request.mode)
        contents = [
            user_prompt,
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
        ]

        config = types.GenerateContentConfig(
            system_instruction=VERIFIER_SYSTEM_PROMPT,
            temperature=0.0,
            response_mime_type="application/json",
            response_schema=GeminiVerificationResult,
        )

        # Step 3: Execute inference via KeyManager (Pool: VISION)
        try:
            raw_response, outcome_type = await key_manager.execute_with_failover(
                primary_pool=PoolType.VISION,
                contents=contents,
                config=config,
            )

            result = GeminiVerificationResult.model_validate_json(raw_response.text)

            # Enforce cross-field referential integrity in Python
            if result.isValid and result.rejectionReason != RejectionReasonEnum.VALID:
                result.rejectionReason = RejectionReasonEnum.VALID
            elif not result.isValid and result.rejectionReason == RejectionReasonEnum.VALID:
                result.rejectionReason = RejectionReasonEnum.IMAGE_TEXT_MISMATCH

            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            response = EvidenceValidationResponse(
                isValid=result.isValid,
                rejectionReason=result.rejectionReason,
                detectedScene=result.detectedScene,
                consistencyScore=result.consistencyScore,
                userFeedback=result.userFeedback,
                processingTimeMs=elapsed_ms,
            )
            return response, AIOutcomeEnum.MODEL, AIFallbackReasonEnum.NONE

        except Exception as exc:
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            exc_str = str(exc).lower()
            logger.warning(
                f"Stage 1 verification failed ({type(exc).__name__}: {str(exc)}). Triggering FAIL-OPEN fallback."
            )

            fallback_reason = AIFallbackReasonEnum.TIMEOUT
            if "429" in exc_str or "quota" in exc_str or "resource_exhausted" in exc_str:
                fallback_reason = AIFallbackReasonEnum.QUOTA_EXHAUSTED
            elif "503" in exc_str or "unavailable" in exc_str or "connection" in exc_str:
                fallback_reason = AIFallbackReasonEnum.PROVIDER_UNAVAILABLE

            # Fail-Open Fallback payload as per Section 7.3
            fallback_response = EvidenceValidationResponse(
                isValid=True,
                rejectionReason=RejectionReasonEnum.VALID,
                detectedScene="Not assessed: AI verification temporarily unavailable.",
                consistencyScore=1.0,
                userFeedback="Verification bypassed due to temporary AI timeout.",
                processingTimeMs=elapsed_ms,
            )
            return fallback_response, AIOutcomeEnum.FALLBACK, fallback_reason


image_verifier_service = ImageVerifierService()
