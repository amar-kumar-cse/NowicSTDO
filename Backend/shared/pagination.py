"""
shared/pagination.py

Generic queryset paginator that returns a standardised response dict.
"""
import math
from typing import Callable, Optional


def paginate(
    queryset,
    page: int = 1,
    page_size: int = 10,
    fields: Optional[list[str]] = None,
    serializer: Optional[Callable] = None,
) -> dict:
    """
    Paginate a Django queryset.

    Args:
        queryset:   Any Django queryset.
        page:       1-indexed current page number.
        page_size:  Number of records per page.

    Returns:
        {
            "success": True,
            "data": [...],          # serialised rows for current page
            "pagination": {
                "page": int,
                "page_size": int,
                "total": int,
                "total_pages": int,
                "has_next": bool,
                "has_prev": bool
            }
        }
    """
    page = max(1, page)
    page_size = max(1, min(page_size, 100))  # cap at 100

    total = queryset.count()
    total_pages = math.ceil(total / page_size) if total else 1

    start = (page - 1) * page_size
    end = start + page_size

    page_qs = queryset[start:end]
    if serializer is not None:
        data = [serializer(row) for row in page_qs]
    elif fields:
        data = list(page_qs.values(*fields))
    else:
        data = list(page_qs.values())

    return {
        "success": True,
        "data": data,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
    }
