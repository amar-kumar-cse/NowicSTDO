import pytest
from datetime import datetime, timedelta, timezone as dt_timezone
from django.test import Client
from django.utils import timezone
from apps.booking.models import BookingService, Appointment

# Use the django_db marker to allow tests to interact with the database.
@pytest.fixture
def api_client():
    return Client()

@pytest.fixture
def auth_headers():
    return {"Authorization": "Bearer test-clerk-token"}

@pytest.fixture
def booking_service(db):
    return BookingService.objects.create(
        name="Consultation",
        slug="consultation",
        description="A cool test service",
        duration_minutes=60,
        price=100.0,
        is_active=True
    )

@pytest.mark.django_db
def test_book_past_date_fails(api_client, booking_service, mocker):
    mocker.patch('shared.auth.ClerkAuth.__call__', return_value="user_id_123")
    past_date = (timezone.now() - timedelta(days=1)).date()
    
    payload = {
        "service_id": booking_service.id,
        "date": str(past_date),
        "time_slot": "10:00"
    }
    
    response = api_client.post(
        "/api/v1/booking/book/",
        data=payload,
        content_type="application/json",
        HTTP_AUTHORIZATION="Bearer token",
    )
    # Since ninja exceptions turn into 409 via global handler
    assert response.status_code == 409
    assert response.json()["error"] == "Cannot book a slot in the past"

@pytest.mark.django_db
def test_book_past_time_same_day_fails(api_client, booking_service, mocker):
    mocker.patch('shared.auth.ClerkAuth.__call__', return_value="user_id_123")
    today = timezone.now().date()
    # Mock timezone.now() to a fixed time, e.g., 14:00
    mock_now = timezone.datetime(today.year, today.month, today.day, 14, 0, tzinfo=dt_timezone.utc)
    mocker.patch('django.utils.timezone.now', return_value=mock_now)
    
    # Try booking at 10:00 AM which is in the past compared to 14:00
    payload = {
        "service_id": booking_service.id,
        "date": str(today),
        "time_slot": "10:00"
    }
    
    response = api_client.post(
        "/api/v1/booking/book/",
        data=payload,
        content_type="application/json",
        HTTP_AUTHORIZATION="Bearer token",
    )
    assert response.status_code == 409
    assert response.json()["error"] == "This time slot has already passed today"

@pytest.mark.django_db
def test_double_booking_fails(api_client, booking_service, mocker):
    mocker.patch('shared.auth.ClerkAuth.__call__', return_value="user_id_123")
    future_date = (timezone.now() + timedelta(days=2)).date()
    
    # Pre-create an appointment holding the slot
    Appointment.objects.create(
        clerk_user_id="other_user_456",
        service=booking_service,
        date=future_date,
        time_slot=datetime.strptime("10:00", "%H:%M").time(),
        status="confirmed"
    )
    
    payload = {
        "service_id": booking_service.id,
        "date": str(future_date),
        "time_slot": "10:00"
    }
    
    response = api_client.post(
        "/api/v1/booking/book/",
        data=payload,
        content_type="application/json",
        HTTP_AUTHORIZATION="Bearer token",
    )
    assert response.status_code == 409
    assert response.json()["error"] == "This time slot is already booked. Please choose another."

@pytest.mark.django_db
def test_book_valid_appointment(api_client, booking_service, mocker):
    mocker.patch('shared.auth.ClerkAuth.__call__', return_value="user_id_123")
    mocker.patch('shared.email.send_mail') # Mock send_mail so it doesn't try sending real emails

    future_date = (timezone.now() + timedelta(days=2)).date()
    
    payload = {
        "service_id": booking_service.id,
        "date": str(future_date),
        "time_slot": "12:00"
    }
    
    response = api_client.post(
        "/api/v1/booking/book/",
        data=payload,
        content_type="application/json",
        HTTP_AUTHORIZATION="Bearer token",
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "confirmed"
    assert data["data"]["clerk_user_id"] == "user_id_123"
