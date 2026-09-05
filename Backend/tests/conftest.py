import pytest
from django.test import Client

@pytest.fixture
def client():
    return Client()

@pytest.fixture
def admin_headers():
    return {"HTTP_AUTHORIZATION": "Bearer mock-admin-token"}

@pytest.fixture  
def client_headers():
    return {"HTTP_AUTHORIZATION": "Bearer mock-client-token"}
