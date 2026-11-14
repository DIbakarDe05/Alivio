"""
Alivio AI Infrastructure - Stage 3 Helpdesk Assistant Prompts & Pre-LLM Guard
Provides system instructions, off-topic regex filters, and context formatters.
"""

import re
from typing import List, Optional
from schemas.chat import ChatMessage, TicketContext

# Allowed quick-reply chips in Alivio
ALLOWED_SUGGESTED_ACTIONS = [
    "View Ticket Status",
    "View Before/After Photos",
    "File New Complaint",
    "Check SLA Policy",
    "Contact Maintenance Desk",
    "Verify Resolved Ticket",
]

# Intent-sensitive off-topic pattern filters
OFF_TOPIC_PATTERNS = [
    # Homework, general math, writing essays
    re.compile(r"\b(write\s+(an?\s+)?essay|write\s+(a\s+)?poem|story|song\s+lyrics)\b", re.IGNORECASE),
    re.compile(r"\b(solve\s+this\s+equation|integrate|derivative|calculate\s+\d+[\+\-\*\/])\b", re.IGNORECASE),
    # Coding / programming requests (excluding campus IT complaints)
    re.compile(r"\b(write\s+(python|javascript|c\+\+|java|rust|sql)\s+code)\b", re.IGNORECASE),
    re.compile(r"\b(debug\s+my\s+code|implement\s+(a\s+)?binary\s+search|leetcode)\b", re.IGNORECASE),
    # Politics, world news, general trivia
    re.compile(r"\b(who\s+won\s+the\s+election|president\s+of|capital\s+of\s+[a-z]+|tell\s+me\s+a\s+joke)\b", re.IGNORECASE),
]

# Campus IT keywords that override false positives in code filtering
CAMPUS_IT_EXCEPTION_PATTERNS = [
    re.compile(r"\b(wifi|wi-fi|internet|lan|port|cable|router|hostel|lab|room|projector|printer|switch)\b", re.IGNORECASE)
]


def is_clearly_off_topic(message: str) -> bool:
    """
    Deterministic pre-LLM scope guard (< 15ms).
    Returns True if query is blatantly off-topic and should bypass the Gemini API.
    Protects campus IT complaints containing technical terms.
    """
    clean_msg = message.strip()

    # Check if any campus maintenance or IT keyword exists
    is_campus_it = any(pattern.search(clean_msg) for pattern in CAMPUS_IT_EXCEPTION_PATTERNS)
    if is_campus_it:
        return False

    # Check off-topic triggers
    for pattern in OFF_TOPIC_PATTERNS:
        if pattern.search(clean_msg):
            return True

    return False


CHATBOT_SYSTEM_PROMPT = """You are the official Alivio Campus Maintenance Helpdesk Assistant.
Your sole purpose is assisting students, faculty, and campus residents with facilities, maintenance tickets, hostel issues, and repair status.

DOMAIN & BEHAVIORAL BOUNDARIES:
- Maintain a polite, empathetic, professional tone.
- Format responses cleanly using GitHub-flavored Markdown.
- If a ticket record is provided in the prompt context, use ONLY that factual data. Never invent staff names, ticket IDs, or completion times.
- Format all SLA deadlines and timestamps in Indian Standard Time (IST / Asia/Kolkata). For instance, "2026-11-15T12:00:00Z" corresponds to "5:30 PM IST on Nov 15, 2026".
- If the user asks about an issue unrelated to campus facilities (e.g. coding, homework, politics, personal advice), politely clarify that you are restricted to campus maintenance queries and set isInScope = false.
- Always provide 2 or 3 suggested actions strictly chosen from the following supported registry:
  * "View Ticket Status"
  * "View Before/After Photos"
  * "File New Complaint"
  * "Check SLA Policy"
  * "Contact Maintenance Desk"
  * "Verify Resolved Ticket"
"""


def build_chat_user_prompt(
    message: str,
    ticket_data: Optional[TicketContext] = None,
    history: Optional[List[ChatMessage]] = None,
) -> str:
    """Builds user prompt for Stage 3 helpdesk conversation with injected ticket context and bounded history."""
    prompt = ""

    if ticket_data:
        prompt += (
            "AUTHORIZED TICKET CONTEXT FROM DATABASE:\n"
            f"- Ticket ID: {ticket_data.ticketId}\n"
            f"- Title: {ticket_data.title}\n"
            f"- Category: {ticket_data.category.value}\n"
            f"- Priority: {ticket_data.priority.value}\n"
            f"- Status: {ticket_data.status}\n"
            f"- Location: {ticket_data.locationDescription}\n"
            f"- Assigned Staff: {ticket_data.assignedStaff or 'Unassigned'}\n"
            f"- SLA Resolution Deadline: {ticket_data.slaDeadline or 'Pending Assignment'}\n\n"
        )

    if history:
        prompt += "PRIOR CONVERSATION HISTORY:\n"
        # Truncate to last 10 entries as required
        bounded_history = history[-10:]
        for turn in bounded_history:
            role_label = "User" if turn.role == "user" else "Assistant"
            prompt += f"{role_label}: {turn.content}\n"
        prompt += "\n"

    prompt += f"CURRENT USER MESSAGE:\n\"{message}\"\n\nProvide your response and 2 to 3 suggested action chips conforming to the schema."
    return prompt
