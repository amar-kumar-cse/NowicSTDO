from types import SimpleNamespace

import pytest

from apps.users.models import UserProfile
from shared.auth import ClerkAuth, get_admin_user, get_current_user
from shared.exceptions import PermissionDenied


@pytest.mark.django_db
class TestAuthSecurity:
    def test_authenticate_returns_none_without_claim_settings(self, settings):
        settings.CLERK_AUDIENCE = ""
        settings.CLERK_ISSUER = ""

        auth = ClerkAuth()
        assert auth.authenticate(request=SimpleNamespace(), token="dummy") is None

    def test_authenticate_returns_none_when_jwks_unavailable(self, settings, monkeypatch):
        settings.CLERK_AUDIENCE = "aud"
        settings.CLERK_ISSUER = "issuer"

        auth = ClerkAuth()
        monkeypatch.setattr(auth, "_get_jwks", lambda: {})

        assert auth.authenticate(request=SimpleNamespace(), token="dummy") is None

    def test_get_current_user_creates_default_client_profile(self):
        request = SimpleNamespace(auth="new_clerk_user")

        profile = get_current_user(request)

        assert profile.clerk_user_id == "new_clerk_user"
        assert profile.role == "client"

    def test_get_admin_user_rejects_non_admin(self):
        UserProfile.objects.create(
            clerk_user_id="non_admin",
            email="non_admin@example.com",
            full_name="Non Admin",
            role="client",
        )

        request = SimpleNamespace(auth="non_admin")

        with pytest.raises(PermissionDenied):
            get_admin_user(request)
