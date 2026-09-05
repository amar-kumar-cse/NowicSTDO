from django.core.cache import cache
from django.http import QueryDict

from shared.cache import _build_cache_key, bump_cache_namespace


class _DummyRequest:
    def __init__(self, path, query):
        self.path = path
        self.GET = QueryDict(query)


def test_cache_key_is_query_order_insensitive():
    cache.clear()
    req_a = _DummyRequest('/api/v1/public/portfolio/', 'featured=true&category=web')
    req_b = _DummyRequest('/api/v1/public/portfolio/', 'category=web&featured=true')

    key_a = _build_cache_key(req_a, 'portfolio-list', 'portfolio')
    key_b = _build_cache_key(req_b, 'portfolio-list', 'portfolio')

    assert key_a == key_b


def test_cache_key_changes_after_namespace_bump():
    cache.clear()
    request = _DummyRequest('/api/v1/public/services/', '')

    key_before = _build_cache_key(request, 'services-list', 'services')
    bump_cache_namespace('services')
    key_after = _build_cache_key(request, 'services-list', 'services')

    assert key_before != key_after
