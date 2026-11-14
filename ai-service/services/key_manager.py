"""
Alivio AI Infrastructure - Multi-Account Key Pool & Bounded Failover Manager
Manages 3 persistent genai.Client instances, cooldown tracking, and 2-attempt failover execution.
Zero LangChain. Uses official google-genai SDK.
"""

import asyncio
import time
from enum import Enum
from typing import Dict, List, Optional, Tuple, Any
from google import genai
from google.genai import types

from config import settings
from utils.logger import logger


class PoolType(str, Enum):
    VISION = "VISION"
    TRIAGE = "TRIAGE"
    CHATBOT = "CHATBOT"


class KeyPoolManager:
    """
    Manages the 3-account API key pool, tracks transient 429 rate-limit cooldowns,
    and executes inference requests with bounded 2-attempt cross-pool failover.
    """

    def __init__(self):
        self._clients: Dict[PoolType, genai.Client] = {}
        self._cooldowns: Dict[PoolType, float] = {
            PoolType.VISION: 0.0,
            PoolType.TRIAGE: 0.0,
            PoolType.CHATBOT: 0.0,
        }
        self._in_flight: Dict[PoolType, int] = {
            PoolType.VISION: 0,
            PoolType.TRIAGE: 0,
            PoolType.CHATBOT: 0,
        }
        self._lock: Optional[asyncio.Lock] = None
        self._initialized = False

    def _get_lock(self) -> asyncio.Lock:
        """Lazily creates the asyncio.Lock within the active running event loop."""
        if self._lock is None:
            self._lock = asyncio.Lock()
        return self._lock

    def initialize(self) -> None:
        """Initializes reusable google-genai SDK clients at application startup."""
        if self._initialized:
            return

        logger.info("Initializing Google GenAI SDK clients for the 3-account pool...")
        self._clients[PoolType.VISION] = genai.Client(api_key=settings.GEMINI_API_KEY_VISION)
        self._clients[PoolType.TRIAGE] = genai.Client(api_key=settings.GEMINI_API_KEY_TRIAGE)
        self._clients[PoolType.CHATBOT] = genai.Client(api_key=settings.GEMINI_API_KEY_CHATBOT)
        self._initialized = True
        logger.info(
            f"Successfully initialized 3 Google GenAI clients (Model: {settings.MODEL_NAME})."
        )

    def close(self) -> None:
        """Closes all clients during application shutdown."""
        self._clients.clear()
        self._initialized = False
        logger.info("All Google GenAI clients closed.")

    def get_active_keys_count(self) -> int:
        """Returns the number of initialized clients in the pool."""
        return len(self._clients)

    def _is_pool_available(self, pool: PoolType) -> bool:
        """Checks if a pool is not currently cooling down."""
        return time.time() > self._cooldowns[pool]

    async def _select_alternate_pool(self, primary_pool: PoolType) -> Optional[PoolType]:
        """
        Selects an alternate pool when primary encounters 429 rate limit.
        Prefers the eligible pool with lowest in-flight request count.
        """
        async with self._get_lock():
            candidates: List[Tuple[int, PoolType]] = []
            for pool in PoolType:
                if pool != primary_pool and self._is_pool_available(pool):
                    candidates.append((self._in_flight[pool], pool))

            if not candidates:
                return None

            # Sort by in-flight count ascending
            candidates.sort(key=lambda x: x[0])
            return candidates[0][1]

    async def _mark_pool_cooldown(self, pool: PoolType) -> None:
        """Places a pool in transient cooldown after receiving a 429 quota exhaustion."""
        async with self._get_lock():
            self._cooldowns[pool] = time.time() + settings.KEY_COOLDOWN_SECONDS
            logger.warning(
                f"Pool {pool.value} placed in cooldown for {settings.KEY_COOLDOWN_SECONDS}s due to 429 rate limit."
            )

    async def execute_with_failover(
        self,
        primary_pool: PoolType,
        contents: List[Any],
        config: types.GenerateContentConfig,
    ) -> Tuple[Any, str]:
        """
        Executes a Gemini inference call using the primary pool with bounded 2-attempt failover.
        Returns:
            Tuple of (response_object, outcome_status)
        Raises:
            Exception if both attempts fail or outer deadline expires.
        """
        start_time = time.time()
        current_pool = primary_pool

        # Attempt 1
        for attempt in range(1, settings.MAX_ATTEMPTS + 1):
            remaining_time = settings.INFERENCE_TIMEOUT_SECONDS - (time.time() - start_time)
            if remaining_time <= 0.3:
                raise TimeoutError("Insufficient time remaining for inference attempt.")

            attempt_timeout = min(settings.PER_ATTEMPT_TIMEOUT_SECONDS, remaining_time)
            client = self._clients.get(current_pool)
            if not client:
                raise RuntimeError(f"Client for pool {current_pool.value} is not initialized.")

            self._in_flight[current_pool] += 1
            try:
                logger.info(
                    f"Executing Gemini inference (Pool: {current_pool.value}, Attempt: {attempt}/{settings.MAX_ATTEMPTS}, Timeout: {attempt_timeout:.1f}s)..."
                )

                response = await asyncio.wait_for(
                    client.aio.models.generate_content(
                        model=settings.MODEL_NAME,
                        contents=contents,
                        config=config,
                    ),
                    timeout=attempt_timeout,
                )
                return response, "model"

            except Exception as exc:
                exc_str = str(exc).lower()
                is_429 = "429" in exc_str or "resource_exhausted" in exc_str or "quota" in exc_str
                logger.warning(
                    f"Inference error on {current_pool.value} (Attempt {attempt}): {type(exc).__name__} - {str(exc)}"
                )

                if is_429:
                    await self._mark_pool_cooldown(current_pool)
                    # Attempt immediate rotation if on first attempt
                    if attempt < settings.MAX_ATTEMPTS:
                        alt_pool = await self._select_alternate_pool(current_pool)
                        if alt_pool:
                            logger.info(
                                f"Cross-pool failover triggered: Rotating from {current_pool.value} to {alt_pool.value} immediately (0ms wait)."
                            )
                            current_pool = alt_pool
                            continue

                # If transient error and time permits, brief backoff
                if attempt < settings.MAX_ATTEMPTS:
                    time_left = settings.INFERENCE_TIMEOUT_SECONDS - (time.time() - start_time)
                    if time_left >= 1.5:
                        await asyncio.sleep(0.4)
                        continue

                # No more attempts or time exhausted
                raise exc

            finally:
                self._in_flight[current_pool] = max(0, self._in_flight[current_pool] - 1)

        raise RuntimeError("Exceeded maximum inference attempts.")


key_manager = KeyPoolManager()
