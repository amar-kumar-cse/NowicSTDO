import pytest
from django.test import override_settings
from django.core.cache import cache
from apps.public.models import ContactSubmission
from apps.crm.models import Lead
from apps.users.models import UserProfile
from tests.factories import ServiceOfferingFactory


@pytest.fixture(autouse=True)
def clear_cache():
    cache.clear()

@pytest.mark.django_db
class TestStatsAPI:
    def test_stats_returns_200(self, client):
        response = client.get('/api/v1/public/stats/')
        assert response.status_code == 200
        assert response.json()['success'] == True
        assert 'team_members' in response.json()['data']

    @override_settings(TEAM_MEMBERS_COUNT=9)
    def test_stats_team_members_from_settings(self, client):
        response = client.get('/api/v1/public/stats/')
        assert response.status_code == 200
        assert response.json()['data']['team_members'] == 9

@pytest.mark.django_db
class TestServicesAPI:
    def test_empty_services_list(self, client):
        response = client.get('/api/v1/public/services/')
        assert response.status_code == 200
        assert response.json()['data'] == []
    
    def test_active_services_returned(self, client):
        ServiceOfferingFactory.create(is_active=True)
        ServiceOfferingFactory.create(is_active=False)
        response = client.get('/api/v1/public/services/')
        assert len(response.json()['data']) == 1

    def test_services_cache_invalidation_after_create(self, client):
        ServiceOfferingFactory.create(is_active=True)
        first = client.get('/api/v1/public/services/').json()['data']
        assert len(first) == 1

        ServiceOfferingFactory.create(is_active=True)
        second = client.get('/api/v1/public/services/').json()['data']
        assert len(second) == 2

@pytest.mark.django_db
class TestContactAPI:
    def test_valid_contact_submission(self, client):
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "project_type": "Web App",
            "message": "Hello from test"
        }
        response = client.post('/api/v1/public/contact/',
                               data=payload, content_type='application/json')
        assert response.status_code == 200
        assert response.json()['success'] == True
        assert ContactSubmission.objects.count() == 1
        assert Lead.objects.filter(source='inbound').count() == 1
    
    def test_invalid_email_rejected(self, client):
        payload = {"name": "Test", "email": "notanemail",
                   "project_type": "Web", "message": "Hi"}
        response = client.post('/api/v1/public/contact/',
                               data=payload, content_type='application/json')
        assert response.status_code == 422

    def test_contact_submission_sanitizes_lead_fields(self, client):
        payload = {
            "name": "  John\x00 Doe  ",
            "email": "  John.Doe@Example.COM  ",
            "project_type": "  Web App  ",
            "message": "  Build MVP\x00 please  ",
        }
        response = client.post('/api/v1/public/contact/', data=payload, content_type='application/json')
        assert response.status_code == 200

        submission = ContactSubmission.objects.latest('id')
        assert submission.name == "John Doe"
        assert submission.email == "john.doe@example.com"
        assert submission.project_type == "Web App"
        assert submission.message == "Build MVP please"

        lead = Lead.objects.latest('id')
        assert lead.founder_name == "John Doe"
        assert lead.email == "john.doe@example.com"
        assert lead.notes == "Build MVP please"


@pytest.mark.django_db
class TestStatsCacheInvalidation:
    def test_stats_cache_invalidates_on_user_change(self, client):
        first = client.get('/api/v1/public/stats/').json()['data']
        first_clients = first['happy_clients']

        UserProfile.objects.create(
            clerk_user_id='cache_user_1',
            email='cache_user_1@example.com',
            full_name='Cache User',
            role='client',
        )

        second = client.get('/api/v1/public/stats/').json()['data']
        assert second['happy_clients'] == first_clients + 1
