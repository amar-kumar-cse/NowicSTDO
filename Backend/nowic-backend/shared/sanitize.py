"""
shared/sanitize.py
"""
from django.core.exceptions import ValidationError
from django.core.validators import validate_email

def sanitize_string(value: str, max_length: int = 1000) -> str:
    if not value:
        return ""
    value = str(value).strip()
    value = value.replace('\x00', '')
    return value[:max_length]

def sanitize_email(value: str) -> str:
    if not value:
        raise ValidationError("Email cannot be empty")
    value = str(value).lower().strip()
    try:
        validate_email(value)
    except ValidationError:
        raise ValidationError("Invalid email format")
    return value
