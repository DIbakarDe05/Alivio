"""
Alivio AI Infrastructure - Configuration Management
Loads and validates environment variables using Pydantic Settings.
"""

from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Three Dedicated API Keys across 3 Distinct Google Cloud Accounts / Projects
    GEMINI_API_KEY_VISION: str = Field(
        default="mock_vision_key",
        description="Google AI Studio API key dedicated for Stage 1 evidence verification",
    )
    GEMINI_API_KEY_TRIAGE: str = Field(
        default="mock_triage_key",
        description="Google AI Studio API key dedicated for Stage 2 triage & deduplication",
    )
    GEMINI_API_KEY_CHATBOT: str = Field(
        default="mock_chatbot_key",
        description="Google AI Studio API key dedicated for Stage 3 helpdesk assistant",
    )

    # Runtime & Model Settings
    MODEL_NAME: str = Field(
        default="gemini-2.5-flash",
        description="Google Gemini model identifier",
    )
    PORT: int = Field(default=8000, description="Service listen port")
    LOG_LEVEL: str = Field(default="INFO", description="Log level (DEBUG, INFO, WARNING, ERROR)")
    PROMPT_VERSION: str = Field(default="2.1.0", description="Tracking version for prompt registry")

    # Latency, Concurrency & Retry Guardrails
    INFERENCE_TIMEOUT_SECONDS: float = Field(
        default=6.0,
        description="Outer maximum application deadline per HTTP request in seconds",
    )
    PER_ATTEMPT_TIMEOUT_SECONDS: float = Field(
        default=3.2,
        description="Single provider attempt timeout in seconds",
    )
    MAX_ATTEMPTS: int = Field(
        default=2,
        description="Maximum provider attempts per request before fallback",
    )
    KEY_COOLDOWN_SECONDS: float = Field(
        default=15.0,
        description="Transient cooldown time for a pool encountering 429 RESOURCE_EXHAUSTED",
    )
    MAX_IN_FLIGHT_REQUESTS: int = Field(
        default=30,
        description="Maximum concurrent in-flight requests admitted before throttling",
    )

    # Memory & Size Safety Boundaries
    MAX_IMAGE_BYTES: int = Field(
        default=5_242_880,
        description="Strict decoded binary image ceiling in RAM (5 MiB)",
    )
    MAX_REQUEST_BODY_BYTES: int = Field(
        default=8_388_608,
        description="Maximum raw ingress HTTP JSON request body in bytes (8 MiB)",
    )
    CHAT_INPUT_TOKEN_BUDGET: int = Field(
        default=1500,
        description="Upper token budget for assembled chat prompt context",
    )

    # Security & Network Allowlists
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:5000", "http://localhost:5173"],
        description="CORS allowed origin list",
    )
    IMAGE_URL_ALLOWED_HOSTS: List[str] = Field(
        default=["res.cloudinary.com"],
        description="Strict domain allowlist for historical SSRF-safe image fetching",
    )


settings = Settings()
