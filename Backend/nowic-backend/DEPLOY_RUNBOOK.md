# Deploy Runbook

This runbook is a compact, execution-ready checklist for production deployments of the Nowic backend.

## 1. Preconditions

- Access to Railway project and production variables.
- Database backup/snapshot completed before deployment.
- Working branch is tested and merged.

## 2. Required Environment Variables

Verify production has all of the following:

- `SECRET_KEY`
- `DEBUG=False`
- `DATABASE_URL`
- `CLERK_JWKS_URL`
- `CLERK_WEBHOOK_SECRET`
- `CLERK_AUDIENCE`
- `CLERK_ISSUER`
- `ALLOWED_HOSTS`
- `ALLOWED_ORIGINS`
- `TRUST_X_FORWARDED_FOR`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `ADMIN_EMAIL`
- `DEFAULT_FROM_EMAIL`
- `TEAM_MEMBERS_COUNT`
- `DJANGO_SETTINGS_MODULE=core.settings.prod`

## 3. Pre-Deploy Validation

Run locally from backend root:

```bash
python manage.py check
python -m pytest -q
```

Optional but recommended:

```bash
python manage.py migrate --plan
```

## 4. Deploy Steps

```bash
railway up
railway run python manage.py migrate
```

If needed once per environment:

```bash
railway run python manage.py createsuperuser
```

## 5. Post-Deploy Smoke Tests

Run against production base URL.

- `GET /api/health/`
- `GET /api/v1/public/services/`
- `GET /api/v1/public/stats/`
- `GET /api/v1/booking/slots/?date=2099-01-01&service_id=<valid-service-id>`

Expected quick checks:

- Health endpoint returns `status: ok` or known degraded state only if dependency issue exists.
- Public endpoints return 200 and structured payload.
- Booking slots endpoint returns deterministic `available` list.
- Auth-protected endpoints reject invalid tokens with 401/403.

## 6. Regression Spot Checks

- Create/update a `ServiceOffering` in admin and recheck `/api/v1/public/services/` for fresh cache output.
- Update a `UserProfile` role and recheck `/api/v1/public/stats/` for `happy_clients` consistency.
- Validate webhook endpoint receives Clerk events without 500 responses.

## 7. Rollback Procedure

1. Roll back Railway service to previous stable release.
2. Re-run smoke tests from Section 5.
3. If the issue is migration-related:
   - Keep DB on current schema if rollback migration is unsafe.
   - Deploy a compatibility hotfix that supports current schema.
4. If rollback requires DB restore, use latest verified snapshot and redeploy stable release.

## 8. Incident Notes Template

Record after every failed deployment:

- Release identifier:
- Time detected:
- User impact:
- Root cause:
- Rollback/hotfix action:
- Preventive action:

## 9. Ownership

- Primary owner: Backend maintainer
- Secondary owner: DevOps/on-call engineer
