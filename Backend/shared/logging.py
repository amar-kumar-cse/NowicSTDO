"""
shared/logging.py
"""
import logging

logger = logging.getLogger('nowic.api')

def log_api_call(endpoint: str, method: str, 
                 status: int, duration_ms: float,
                 user_id: str = None):
    logger.info(f"API {method} {endpoint} -> {status} ({duration_ms:.1f}ms) user={user_id}")

def log_security_event(event: str, ip: str, details: str = ''):
    security_logger = logging.getLogger('nowic.security')
    security_logger.warning(f"SECURITY {event} ip={ip} {details}")

def log_error(error: Exception, context: str = ''):
    error_logger = logging.getLogger('nowic')
    error_logger.error(f"ERROR in {context}: {str(error)}", exc_info=True)
