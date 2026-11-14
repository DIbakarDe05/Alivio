"""
Alivio AI Infrastructure - Stage 3 Helpdesk Assistant Service
Handles domain-restricted chat conversations, pre-LLM regex scope guard, history pruning,
and grounded response generation with quick-reply chips.
"""

import time
from typing import Tuple
from google.genai import types

from schemas.enums import AIOutcomeEnum, AIFallbackReasonEnum
from schemas.chat import ChatRequest, GeminiChatResult, ChatResponse
from services.key_manager import key_manager, PoolType
from prompts.chatbot import (
    CHATBOT_SYSTEM_PROMPT,
    ALLOWED_SUGGESTED_ACTIONS,
    is_clearly_off_topic,
    build_chat_user_prompt,
)
from utils.logger import logger


class ChatbotService:
    """Service encapsulating Stage 3 domain-restricted helpdesk logic."""

    async def handle_chat(
        self,
        request: ChatRequest,
    ) -> Tuple[ChatResponse, AIOutcomeEnum, AIFallbackReasonEnum]:
        """
        Executes helpdesk conversation flow.
        1. Pre-LLM Scope Guard (< 15ms) blocks off-topic queries without spending Gemini quota.
        2. Gemini API generates grounded response with temperature=0.3.
        3. Returns polite fallback if Gemini fails.
        """
        start_time = time.perf_counter()

        # Step 1: Deterministic Pre-LLM Scope Guard
        if is_clearly_off_topic(request.message):
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.info("Pre-LLM Scope Guard triggered: Off-topic query bypassed Gemini call.")
            guard_response = ChatResponse(
                reply=(
                    "I am the Alivio Campus Maintenance Assistant. I am restricted to helping "
                    "with campus facilities, hostel amenities, maintenance requests, and ticket tracking. "
                    "Please let me know how I can help with your campus maintenance needs!"
                ),
                isInScope=False,
                suggestedActions=[
                    "View Ticket Status",
                    "File New Complaint",
                    "Contact Maintenance Desk",
                ],
                processingTimeMs=elapsed_ms,
            )
            return guard_response, AIOutcomeEnum.SCOPE_GUARD, AIFallbackReasonEnum.NONE

        # Step 2: Build prompt with bounded history and ticket context
        user_prompt = build_chat_user_prompt(
            message=request.message,
            ticket_data=request.ticketData,
            history=request.conversationHistory,
        )

        config = types.GenerateContentConfig(
            system_instruction=CHATBOT_SYSTEM_PROMPT,
            temperature=0.3,
            response_mime_type="application/json",
            response_schema=GeminiChatResult,
        )

        # Step 3: Execute inference via KeyManager (Pool: CHATBOT)
        try:
            raw_response, outcome_type = await key_manager.execute_with_failover(
                primary_pool=PoolType.CHATBOT,
                contents=[user_prompt],
                config=config,
            )

            result = GeminiChatResult.model_validate_json(raw_response.text)

            # Sanitize suggested actions to ensure they belong to supported registry
            validated_actions = [
                act for act in result.suggestedActions if act in ALLOWED_SUGGESTED_ACTIONS
            ]
            if len(validated_actions) < 2:
                validated_actions = ["View Ticket Status", "Contact Maintenance Desk"]

            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            response = ChatResponse(
                reply=result.reply,
                isInScope=result.isInScope,
                suggestedActions=validated_actions[:3],
                processingTimeMs=elapsed_ms,
            )
            return response, AIOutcomeEnum.MODEL, AIFallbackReasonEnum.NONE

        except Exception as exc:
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            exc_str = str(exc).lower()
            logger.warning(
                f"Stage 3 chat failed ({type(exc).__name__}: {str(exc)}). Triggering POLITE fallback."
            )

            fallback_reason = AIFallbackReasonEnum.TIMEOUT
            if "429" in exc_str or "quota" in exc_str or "resource_exhausted" in exc_str:
                fallback_reason = AIFallbackReasonEnum.QUOTA_EXHAUSTED
            elif "503" in exc_str or "unavailable" in exc_str or "connection" in exc_str:
                fallback_reason = AIFallbackReasonEnum.PROVIDER_UNAVAILABLE

            # Polite Fallback as per Section 7.3
            fallback_response = ChatResponse(
                reply=(
                    "I am temporarily unable to reach the AI assistant. "
                    "Please check your ticket status on the dashboard or contact the campus maintenance helpdesk directly."
                ),
                isInScope=True,
                suggestedActions=[
                    "View Ticket Status",
                    "Contact Maintenance Desk",
                ],
                processingTimeMs=elapsed_ms,
            )
            return fallback_response, AIOutcomeEnum.FALLBACK, fallback_reason


chatbot_service = ChatbotService()
