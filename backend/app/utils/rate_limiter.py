import asyncio
import time


class RateLimiter:
    """Token-bucket rate limiter for Groq API calls."""

    def __init__(self, rpm: int = 30, min_delay: float = 2.5):
        self._rpm = rpm
        self._min_delay = min_delay
        self._last_call_time: float = 0.0
        self._lock = asyncio.Lock()

    async def acquire(self) -> None:
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_call_time
            if elapsed < self._min_delay:
                wait = self._min_delay - elapsed
                await asyncio.sleep(wait)
            self._last_call_time = time.monotonic()


# Global rate limiter instance
rate_limiter = RateLimiter()
