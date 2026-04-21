import pytest
from datetime import date
from django.db import IntegrityError
from tests.factories import BookingServiceFactory, AppointmentFactory

@pytest.mark.django_db
class TestBookingSlots:
    def test_all_slots_available_for_new_date(self, client):
        service = BookingServiceFactory.create()
        response = client.get('/api/v1/booking/slots/',
                              {'date': '2099-01-01', 'service_id': service.id})
        assert response.status_code == 200
        assert len(response.json()['data']['available']) == 7
    
    def test_booked_slot_not_in_available(self, client):
        appt = AppointmentFactory.create(
            date=date(2099, 1, 1), time_slot='10:00')
        response = client.get('/api/v1/booking/slots/',
                              {'date': '2099-01-01', 
                               'service_id': appt.service.id})
        assert '10:00' not in response.json()['data']['available']

    def test_same_slot_available_for_different_service(self, client):
        primary_service = BookingServiceFactory.create()
        other_service = BookingServiceFactory.create()
        AppointmentFactory.create(
            service=primary_service,
            date=date(2099, 1, 1),
            time_slot='10:00',
            status='confirmed',
        )

        response = client.get(
            '/api/v1/booking/slots/',
            {'date': '2099-01-01', 'service_id': other_service.id},
        )
        assert response.status_code == 200
        assert '10:00' in response.json()['data']['available']
    
    def test_past_date_booking_rejected(self, client, admin_headers, monkeypatch):
        service = BookingServiceFactory.create()
        monkeypatch.setattr('shared.auth.ClerkAuth.__call__', lambda *args, **kwargs: "admin_user_1")
        payload = {
            "service_id": service.id,
            "date": "2000-01-01",
            "time_slot": "10:00"
        }
        response = client.post('/api/v1/booking/book/',
                               data=payload, content_type='application/json',
                               **admin_headers)
        assert response.status_code == 409
        assert response.json()['error'] == 'Cannot book a slot in the past'

    def test_integrity_error_during_create_returns_409(self, client, admin_headers, monkeypatch):
        service = BookingServiceFactory.create()
        monkeypatch.setattr('shared.auth.ClerkAuth.__call__', lambda *args, **kwargs: "admin_user_2")

        def _raise_integrity_error(*args, **kwargs):
            raise IntegrityError('simulated race conflict')

        monkeypatch.setattr('apps.booking.api.Appointment.objects.create', _raise_integrity_error)

        payload = {
            "service_id": service.id,
            "date": "2099-01-01",
            "time_slot": "10:00",
        }
        response = client.post(
            '/api/v1/booking/book/',
            data=payload,
            content_type='application/json',
            **admin_headers,
        )
        assert response.status_code == 409
        assert response.json()['error'] == 'This time slot is already booked. Please choose another.'
