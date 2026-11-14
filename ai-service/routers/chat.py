"""
Alivio AI Infrastructure - Stage 3 Helpdesk Assistant Router
Exposes POST /api/v1/chat and attaches X-AI-Outcome metadata headers.
"""

from fastapi import APIRouter, Response, status
from schemas.chat import ChatRequest, ChatResponse
from services.chatbot import chatbot_service

router = APIRouter(prefix="/api/v1", tags=["Helpdesk Chatbot"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Stage 3: Scope-Restricted Helpdesk Assistant",
)
async def chat_helpdesk(
    request: ChatRequest,
    response: Response,
) -> ChatResponse:
    """
    Handles student and resident queries regarding campus maintenance and ticket progress.
    Includes <15ms pre-LLM regex scope guard, history truncation to 10 turns,
    and grounded answers using injected ticket context.
    """
    res_data, outcome, fallback_reason = await chatbot_service.handle_chat(request)

    response.headers["X-AI-Outcome"] = outcome.value
    response.headers["X-AI-Fallback-Reason"] = fallback_reason.value

    return res_data
