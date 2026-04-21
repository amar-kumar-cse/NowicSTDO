"""
shared/cache.py
"""
import hashlib
from functools import wraps
from django.core.cache import cache


def _namespace_version_key(namespace: str) -> str:
    return f"cache:nsver:{namespace}"


def _get_namespace_version(namespace: str) -> int:
    key = _namespace_version_key(namespace)
    version = cache.get(key)
    if version is None:
        cache.set(key, 1, timeout=None)
        return 1
    return int(version)


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
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return cached_data
            
            response = view_func(request, *args, **kwargs)
            cache.set(cache_key, response, timeout=timeout)
            return response
        return _wrapped_view
    return decorator


def bump_cache_namespace(namespace: str):
    ns_key = _namespace_version_key(namespace)
    if not cache.add(ns_key, 1, timeout=None):
        try:
            cache.incr(ns_key)
        except ValueError:
            cache.set(ns_key, 2, timeout=None)


def invalidate_cache(key: str):
    cache.delete(key)
