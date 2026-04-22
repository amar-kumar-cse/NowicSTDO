"""
shared/ratelimit.py

Cache-based rate limiter — no external library required.
Uses Django's default cache backend.
"""
import time
from django.core.cache import cache


def get_client_ip(request) -> str:
    """
    Extract real client IP from the request.

    Honours X-Forwarded-For for deployments behind a proxy (e.g. Railway).
    Takes only the first (leftmost) IP to prevent spoofing via appended IPs.
    Falls back to REMOTE_ADDR if the header is absent.
    """
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "127.0.0.1")


class RateLimiter:
    """
    Fixed-window rate limiter backed by Django cache.

    Args:
        key_prefix: Unique string prefix to namespace the counter.
        max_calls:  Maximum number of calls allowed within the period.
        period:     Time window in seconds.
    """

    def __init__(self, key_prefix: str, max_calls: int, period: int):
        self.key_prefix = key_prefix
        self.max_calls = max_calls
        self.period = period

    def _make_key(self, identifier: str) -> str:
        return f"rl:{self.key_prefix}:{identifier}"

    def _make_start_key(self, identifier: str) -> str:
        return f"rl:{self.key_prefix}:{identifier}:start"

    def check(self, identifier: str) -> dict:
        """
        Check and increment the rate-limit counter for `identifier`.

        Returns:
            {
                "allowed": bool,
                "remaining": int,   # calls remaining in current window
                "reset_seconds": int  # seconds until window resets
            }
        """
        key = self._make_key(identifier)
        start_key = self._make_start_key(identifier)
        count = cache.get(key)

        if count is None:
            # First call in this window — set counter with TTL
            cache.set(key, 1, timeout=self.period)
            cache.set(start_key, int(time.time()), timeout=self.period)
            result = {
                "allowed": True,
                "remaining": self.max_calls - 1,
                "reset_seconds": self.period,
            }
            result["headers"] = {
                "X-RateLimit-Limit": str(self.max_calls),
                "X-RateLimit-Remaining": str(result["remaining"]),
                "X-RateLimit-Reset": str(result["reset_seconds"]),
            }
            return result

        # Increment atomically; read TTL to report reset time
        try:
            new_count = cache.incr(key)
        except ValueError:
            # Counter evicted between get and incr: restart window cleanly.
            cache.set(key, 1, timeout=self.period)
            cache.set(start_key, int(time.time()), timeout=self.period)
            result = {
                "allowed": True,
                "remaining": self.max_calls - 1,
                "reset_seconds": self.period,
            }
            result["headers"] = {
                "X-RateLimit-Limit": str(self.max_calls),
                "X-RateLimit-Remaining": str(result["remaining"]),
                "X-RateLimit-Reset": str(result["reset_seconds"]),
            }
            return result

        start_ts = cache.get(start_key)
        if start_ts is None:
            start_ts = int(time.time())
            cache.set(start_key, start_ts, timeout=self.period)

        elapsed = max(0, int(time.time()) - int(start_ts))
        reset_seconds = max(1, self.period - elapsed)

        if new_count > self.max_calls:
            result = {
                "allowed": False,
                "remaining": 0,
                "reset_seconds": reset_seconds,
            }
            result["headers"] = {
                "X-RateLimit-Limit": str(self.max_calls),
                "X-RateLimit-Remaining": str(result["remaining"]),
                "X-RateLimit-Reset": str(result["reset_seconds"]),
            }
            return result

        result = {
            "allowed": True,
            "remaining": max(0, self.max_calls - new_count),
            "reset_seconds": reset_seconds,
        }
        result["headers"] = {
            "X-RateLimit-Limit": str(self.max_calls),
            "X-RateLimit-Remaining": str(result["remaining"]),
            "X-RateLimit-Reset": str(result["reset_seconds"]),
        }
        return result


# Ready-to-use limiter instances
contact_limiter = RateLimiter("contact", max_calls=3, period=3600)
booking_limiter = RateLimiter("booking", max_calls=5, period=86400)
