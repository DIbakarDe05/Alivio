"""
Alivio AI Infrastructure - Structured JSON Logger
Emits JSON-formatted log lines with X-Request-ID correlation and sensitive data redaction.
"""

import json
import logging
import sys
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any, Dict, Optional

# Context variable holding the correlation ID for the active async task/request
correlation_id_ctx: ContextVar[Optional[str]] = ContextVar("correlation_id", default=None)

# Keys that should never be logged in clear text
REDACTED_KEYS = {
    "gemini_api_key",
    "api_key",
    "key",
    "authorization",
    "token",
    "imagebase64",
    "image_base64",
    "base64",
}


def sanitize_data(data: Any) -> Any:
    """Recursively redacts sensitive keys and truncates long base64 strings."""
    if isinstance(data, dict):
        sanitized = {}
        for k, v in data.items():
            if str(k).lower() in REDACTED_KEYS:
                sanitized[k] = "[REDACTED]"
            elif isinstance(v, str) and (v.startswith("data:image/") or len(v) > 500):
                sanitized[k] = f"<{v[:20]}...[TRUNCATED {len(v)} chars]>"
            else:
                sanitized[k] = sanitize_data(v)
        return sanitized
    elif isinstance(data, list):
        return [sanitize_data(item) for item in data]
    return data


class JSONFormatter(logging.Formatter):
    """Custom formatter emitting structured single-line JSON logs."""

    def format(self, record: logging.LogRecord) -> str:
        log_obj: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "requestId": correlation_id_ctx.get() or "system",
        }

        # Include custom extra fields if provided
        if hasattr(record, "extra_fields") and isinstance(record.extra_fields, dict):
            log_obj.update(sanitize_data(record.extra_fields))

        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_obj)


def setup_logger(name: str = "alivio-ai", level: str = "INFO") -> logging.Logger:
    """Configures and returns a structured JSON logger."""
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Avoid duplicate handlers on re-initialization
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)

    logger.propagate = False
    return logger


logger = setup_logger()
