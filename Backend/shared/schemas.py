"""
shared/schemas.py

Common schemas used across the API to ensure consistent response formatting.
"""
from typing import Any, Optional, Dict
from ninja import Schema

class ErrorSchema(Schema):
    success: bool = False
    error: Any
    code: Optional[str] = None
    retry_after: Optional[int] = None

class SuccessSchema(Schema):
    success: bool = True
    data: Optional[Any] = None

ERROR_RESPONSES = {
    400: ErrorSchema,
    401: ErrorSchema,
    403: ErrorSchema,
    404: ErrorSchema,
    409: ErrorSchema,
    422: ErrorSchema,
    429: ErrorSchema,
    500: ErrorSchema,
}

def standard_responses(success_schema: Any = dict) -> Dict[int, Any]:
    """
    Returns a dictionary mapping HTTP status codes to Ninja schemas.
    Automatically merges the 200 success schema with all global error schemas.
    """
    responses = {200: success_schema}
    responses.update(ERROR_RESPONSES)
    return responses
