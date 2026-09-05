import json
import binascii

import pytest
from svix.webhooks import WebhookVerificationError

from apps.users.models import UserProfile


@pytest.mark.django_db
class TestUsersWebhook:
    def test_user_updated_event_upserts_profile(self, client, monkeypatch):
        class FakeWebhook:
            def __init__(self, secret):
                self.secret = secret

            def verify(self, payload_bytes, headers):
                return {
                    "type": "user.updated",
                    "data": {
                        "id": "clerk_user_123",
                        "first_name": "John",
                        "last_name": "Doe",
                        "primary_email_address_id": "em_1",
                        "email_addresses": [
                            {"id": "em_1", "email_address": "john@example.com"}
                        ],
                    },
                }

        monkeypatch.setattr("apps.users.api.Webhook", FakeWebhook)

        response = client.post(
            "/api/webhook/clerk/",
            data=json.dumps({"dummy": True}),
            content_type="application/json",
            HTTP_SVIX_ID="1",
            HTTP_SVIX_TIMESTAMP="1",
            HTTP_SVIX_SIGNATURE="sig",
        )

        assert response.status_code == 200
        profile = UserProfile.objects.get(clerk_user_id="clerk_user_123")
        assert profile.email == "john@example.com"
        assert profile.full_name == "John Doe"
        assert profile.role == "client"
        assert profile.is_active is True

    def test_user_updated_event_updates_existing_profile(self, client, monkeypatch):
        UserProfile.objects.create(
            clerk_user_id="clerk_user_456",
            email="old@example.com",
            full_name="Old Name",
            role="admin",
            is_active=False,
        )

        class FakeWebhook:
            def __init__(self, secret):
                self.secret = secret

            def verify(self, payload_bytes, headers):
                return {
                    "type": "user.updated",
                    "data": {
                        "id": "clerk_user_456",
                        "first_name": "Jane",
                        "last_name": "Smith",
                        "primary_email_address_id": "em_2",
                        "email_addresses": [
                            {"id": "em_2", "email_address": "jane@example.com"}
                        ],
                    },
                }

        monkeypatch.setattr("apps.users.api.Webhook", FakeWebhook)

        response = client.post(
            "/api/webhook/clerk/",
            data=json.dumps({"dummy": True}),
            content_type="application/json",
            HTTP_SVIX_ID="2",
            HTTP_SVIX_TIMESTAMP="2",
            HTTP_SVIX_SIGNATURE="sig",
        )

        assert response.status_code == 200
        profile = UserProfile.objects.get(clerk_user_id="clerk_user_456")
        assert profile.email == "jane@example.com"
        assert profile.full_name == "Jane Smith"
        assert profile.role == "client"
        assert profile.is_active is True

    def test_invalid_signature_returns_400(self, client, monkeypatch):
        class FakeWebhook:
            def __init__(self, secret):
                self.secret = secret

            def verify(self, payload_bytes, headers):
                raise WebhookVerificationError("invalid")

        monkeypatch.setattr("apps.users.api.Webhook", FakeWebhook)

        response = client.post(
            "/api/webhook/clerk/",
            data=json.dumps({"dummy": True}),
            content_type="application/json",
            HTTP_SVIX_ID="3",
            HTTP_SVIX_TIMESTAMP="3",
            HTTP_SVIX_SIGNATURE="sig",
        )

        assert response.status_code == 400
        assert response.json()["error"] == "Invalid signature"
        assert response.json()["code"] == "INVALID_SIGNATURE"

    def test_user_updated_missing_email_returns_400(self, client, monkeypatch):
        class FakeWebhook:
            def __init__(self, secret):
                self.secret = secret

            def verify(self, payload_bytes, headers):
                return {
                    "type": "user.updated",
                    "data": {
                        "id": "clerk_user_789",
                        "first_name": "No",
                        "last_name": "Email",
                        "primary_email_address_id": "em_missing",
                        "email_addresses": [],
                    },
                }

        monkeypatch.setattr("apps.users.api.Webhook", FakeWebhook)

        response = client.post(
            "/api/webhook/clerk/",
            data=json.dumps({"dummy": True}),
            content_type="application/json",
            HTTP_SVIX_ID="4",
            HTTP_SVIX_TIMESTAMP="4",
            HTTP_SVIX_SIGNATURE="sig",
        )

        assert response.status_code == 400
        assert response.json()["error"] == "Invalid payload"
        assert response.json()["code"] == "INVALID_PAYLOAD"

    def test_user_created_missing_email_returns_400(self, client, monkeypatch):
        class FakeWebhook:
            def __init__(self, secret):
                self.secret = secret

            def verify(self, payload_bytes, headers):
                return {
                    "type": "user.created",
                    "data": {
                        "id": "clerk_user_created_invalid",
                        "first_name": "Bad",
                        "last_name": "Email",
                        "primary_email_address_id": "missing",
                        "email_addresses": [],
                    },
                }

        monkeypatch.setattr("apps.users.api.Webhook", FakeWebhook)

        response = client.post(
            "/api/webhook/clerk/",
            data=json.dumps({"dummy": True}),
            content_type="application/json",
            HTTP_SVIX_ID="6",
            HTTP_SVIX_TIMESTAMP="6",
            HTTP_SVIX_SIGNATURE="sig",
        )

        assert response.status_code == 400
        assert response.json()["code"] == "INVALID_PAYLOAD"

    def test_webhook_config_error_returns_400(self, client, monkeypatch):
        class BrokenWebhook:
            def __init__(self, secret):
                raise binascii.Error("bad secret")

        monkeypatch.setattr("apps.users.api.Webhook", BrokenWebhook)

        response = client.post(
            "/api/webhook/clerk/",
            data=json.dumps({"dummy": True}),
            content_type="application/json",
            HTTP_SVIX_ID="7",
            HTTP_SVIX_TIMESTAMP="7",
            HTTP_SVIX_SIGNATURE="sig",
        )

        assert response.status_code == 400
        assert response.json()["code"] == "WEBHOOK_CONFIG_ERROR"

    def test_user_updated_email_conflict_returns_409(self, client, monkeypatch):
        UserProfile.objects.create(
            clerk_user_id="existing_owner",
            email="taken@example.com",
            full_name="Existing Owner",
            role="client",
        )
        UserProfile.objects.create(
            clerk_user_id="clerk_user_target",
            email="target@example.com",
            full_name="Target User",
            role="client",
        )

        class FakeWebhook:
            def __init__(self, secret):
                self.secret = secret

            def verify(self, payload_bytes, headers):
                return {
                    "type": "user.updated",
                    "data": {
                        "id": "clerk_user_target",
                        "first_name": "Target",
                        "last_name": "User",
                        "primary_email_address_id": "em_taken",
                        "email_addresses": [
                            {"id": "em_taken", "email_address": "taken@example.com"}
                        ],
                    },
                }

        monkeypatch.setattr("apps.users.api.Webhook", FakeWebhook)

        response = client.post(
            "/api/webhook/clerk/",
            data=json.dumps({"dummy": True}),
            content_type="application/json",
            HTTP_SVIX_ID="8",
            HTTP_SVIX_TIMESTAMP="8",
            HTTP_SVIX_SIGNATURE="sig",
        )

        assert response.status_code == 409
        assert response.json()["code"] == "EMAIL_CONFLICT"

    def test_user_deleted_missing_id_returns_400(self, client, monkeypatch):
        class FakeWebhook:
            def __init__(self, secret):
                self.secret = secret

            def verify(self, payload_bytes, headers):
                return {
                    "type": "user.deleted",
                    "data": {},
                }

        monkeypatch.setattr("apps.users.api.Webhook", FakeWebhook)

        response = client.post(
            "/api/webhook/clerk/",
            data=json.dumps({"dummy": True}),
            content_type="application/json",
            HTTP_SVIX_ID="5",
            HTTP_SVIX_TIMESTAMP="5",
            HTTP_SVIX_SIGNATURE="sig",
        )

        assert response.status_code == 400
        assert response.json()["error"] == "Invalid payload"
        assert response.json()["code"] == "INVALID_PAYLOAD"
