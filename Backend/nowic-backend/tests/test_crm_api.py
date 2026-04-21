import pytest
from apps.crm.models import Lead
from apps.public.models import ContactSubmission
from tests.factories import LeadFactory
from apps.users.models import UserProfile
from tests.factories import AdminUserFactory


@pytest.fixture
def admin_identity(monkeypatch):
    admin = AdminUserFactory.create()
    monkeypatch.setattr('shared.auth.ClerkAuth.__call__', lambda *args, **kwargs: admin.clerk_user_id)
    return admin

@pytest.mark.django_db
class TestLeadsAPI:
    def test_unauthenticated_leads_returns_401(self, client):
        response = client.get('/api/v1/crm/leads/')
        assert response.status_code == 401
    
    def test_client_role_returns_403(self, client, client_headers, monkeypatch):
        UserProfile.objects.create(
            clerk_user_id="client_user_1",
            email="client1@example.com",
            full_name="Client One",
            role="client",
        )
        monkeypatch.setattr('shared.auth.ClerkAuth.__call__', lambda *args, **kwargs: "client_user_1")
        response = client.get('/api/v1/crm/leads/', **client_headers)
        assert response.status_code == 403
    
    def test_admin_can_list_leads(self, client, admin_headers, monkeypatch):
        UserProfile.objects.create(
            clerk_user_id="admin_user_1",
            email="admin1@example.com",
            full_name="Admin One",
            role="admin",
        )
        monkeypatch.setattr('shared.auth.ClerkAuth.__call__', lambda *args, **kwargs: "admin_user_1")
        LeadFactory.create_batch(3)
        response = client.get('/api/v1/crm/leads/', **admin_headers)
        assert response.status_code == 200
        assert response.json()['success'] is True
        assert len(response.json()['data']) == 3

    def test_admin_update_lead_sanitizes_fields(self, client, admin_headers, monkeypatch):
        UserProfile.objects.create(
            clerk_user_id="admin_user_2",
            email="admin2@example.com",
            full_name="Admin Two",
            role="admin",
        )
        monkeypatch.setattr('shared.auth.ClerkAuth.__call__', lambda *args, **kwargs: "admin_user_2")
        lead = LeadFactory.create(
            company_name="Old Co",
            founder_name="Old Name",
            email="old@example.com",
            notes="old note",
        )
        payload = {
            "company_name": "  New\x00 Co  ",
            "founder_name": "  Founder\x00 Name  ",
            "email": "  New.Admin@Example.COM ",
            "notes": "  Updated\x00 notes  "
        }
        response = client.patch(
            f'/api/v1/crm/leads/{lead.id}/',
            data=payload,
            content_type='application/json',
            **admin_headers,
        )
        assert response.status_code == 200

        lead.refresh_from_db()
        assert lead.company_name == "New Co"
        assert lead.founder_name == "Founder Name"
        assert lead.email == "new.admin@example.com"
        assert lead.notes == "Updated notes"

    def test_admin_update_lead_invalid_email_returns_422(self, client, admin_headers, monkeypatch):
        UserProfile.objects.create(
            clerk_user_id="admin_user_3",
            email="admin3@example.com",
            full_name="Admin Three",
            role="admin",
        )
        monkeypatch.setattr('shared.auth.ClerkAuth.__call__', lambda *args, **kwargs: "admin_user_3")
        lead = LeadFactory.create()

        response = client.patch(
            f'/api/v1/crm/leads/{lead.id}/',
            data={"email": "notanemail"},
            content_type='application/json',
            **admin_headers,
        )
        assert response.status_code == 422


@pytest.mark.django_db
class TestCrmPagination:
    def test_projects_endpoint_returns_paginated_shape(self, client, admin_headers, admin_identity):
        from apps.crm.models import Project
        Project.objects.create(name="P1", deadline="2099-01-01", cost=100, progress=10, status="planning")
        Project.objects.create(name="P2", deadline="2099-01-02", cost=200, progress=20, status="in_progress")
        Project.objects.create(name="P3", deadline="2099-01-03", cost=300, progress=30, status="review")

        response = client.get('/api/v1/crm/projects/?page=1&page_size=2', **admin_headers)
        assert response.status_code == 200
        body = response.json()
        assert body['success'] is True
        assert len(body['data']) == 2
        assert body['pagination']['page'] == 1
        assert body['pagination']['page_size'] == 2
        assert body['pagination']['total'] == 3

    def test_projects_endpoint_status_filter_with_pagination(self, client, admin_headers, admin_identity):
        from apps.crm.models import Project
        Project.objects.create(name="Plan", deadline="2099-02-01", cost=100, progress=10, status="planning")
        Project.objects.create(name="Build", deadline="2099-02-02", cost=200, progress=20, status="in_progress")
        Project.objects.create(name="Review", deadline="2099-02-03", cost=300, progress=30, status="review")

        response = client.get('/api/v1/crm/projects/?status=in_progress&page=1&page_size=10', **admin_headers)
        assert response.status_code == 200
        body = response.json()
        assert body['success'] is True
        assert body['pagination']['total'] == 1
        assert len(body['data']) == 1
        assert body['data'][0]['status'] == 'in_progress'

    def test_submissions_endpoint_returns_paginated_shape(self, client, admin_headers, admin_identity):
        ContactSubmission.objects.create(
            name='A',
            email='a@example.com',
            project_type='Web',
            message='m1',
            status='new',
        )
        ContactSubmission.objects.create(
            name='B',
            email='b@example.com',
            project_type='Web',
            message='m2',
            status='read',
        )
        ContactSubmission.objects.create(
            name='C',
            email='c@example.com',
            project_type='Web',
            message='m3',
            status='new',
        )

        response = client.get('/api/v1/crm/submissions/?status=new&page=1&page_size=1', **admin_headers)
        assert response.status_code == 200
        body = response.json()
        assert body['success'] is True
        assert len(body['data']) == 1
        assert body['pagination']['total'] == 2
        assert body['pagination']['page_size'] == 1
