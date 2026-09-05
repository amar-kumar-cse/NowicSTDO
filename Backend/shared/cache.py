"""
shared/cache.py
"""
import hashlib
import logging
from functools import wraps
from django.core.cache import cache

logger = logging.getLogger(__name__)


def _namespace_version_key(namespace: str) -> str:
    return f"cache:nsver:{namespace}"


def _get_namespace_version(namespace: str) -> int:
    key = _namespace_version_key(namespace)
    try:
        version = cache.get(key)
        if version is None:
            cache.set(key, 1, timeout=None)
            return 1
        return int(version)
    except Exception:
        # Fail open: if cache backend is unavailable, keep API responses working.
        logger.warning("Cache unavailable while reading namespace version", exc_info=True)
        return 1


def _build_cache_key(request, key: str, namespace: str) -> str:
    query_items = []
    for param in sorted(request.GET.keys()):
        values = request.GET.getlist(param)
        for val in values:
            query_items.append(f"{param}={val}")
    query_part = "&".join(query_items)
    version = _get_namespace_version(namespace)
    raw = f"{namespace}|v{version}|{key}|{request.path}|{query_part}"
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    return f"cache:{namespace}:{digest}"


def cache_response(key: str, timeout: int = 300, namespace: str | None = None):
    ns = namespace or key

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            cache_key = _build_cache_key(request, key, ns)
            try:
                cached_data = cache.get(cache_key)
                if cached_data is not None:
                    return cached_data
            except Exception:
                logger.warning("Cache unavailable while reading response cache", exc_info=True)

            response = view_func(request, *args, **kwargs)

            try:
                cache.set(cache_key, response, timeout=timeout)
            except Exception:
                logger.warning("Cache unavailable while writing response cache", exc_info=True)

            return response
        return _wrapped_view
    return decorator


def bump_cache_namespace(namespace: str):
    ns_key = _namespace_version_key(namespace)
    try:
        if not cache.add(ns_key, 1, timeout=None):
            try:
                cache.incr(ns_key)
            except ValueError:
                cache.set(ns_key, 2, timeout=None)
    except Exception:
        logger.warning("Cache unavailable while bumping namespace", exc_info=True)


def invalidate_cache(key: str):
    try:
        cache.delete(key)
    except Exception:
        logger.warning("Cache unavailable while deleting key", exc_info=True)
