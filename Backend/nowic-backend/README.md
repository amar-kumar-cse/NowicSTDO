# Nowic Studio — Backend API

Production-ready Django backend for [Nowic Studio](https://nowicstudio.in) — a software agency.

Built with **Django 5**, **Django Ninja**, **PostgreSQL (Supabase)**, and **Clerk JWT auth**.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Django 5.0 |
| API | Django Ninja 1.x (OpenAPI auto-docs) |
| Database | PostgreSQL via Supabase |
| Auth | Clerk JWT (RS256 / HttpBearer) |
| Cache / Queue | Redis + Celery + django-celery-beat |
| Email | Django SMTP (Gmail App Password) |
| Media | Cloudinary |
| Static Files | WhiteNoise |
| Error Tracking | Sentry |
| Deploy | Railway.app + Gunicorn |

---

## Project Structure

```
nowic-backend/
├── core/                    # Django project config
│   ├── settings/
│   │   ├── base.py          # Shared settings (all environments)
│   │   ├── dev.py           # Development overrides (SQLite, console email)
│   │   └── prod.py          # Production hardening
│   ├── api.py               # NinjaAPI root + router wiring
│   ├── celery.py            # Celery app + beat schedule
│   └── urls.py              # URL conf
├── apps/
│   ├── users/               # Clerk webhook sync → UserProfile
│   ├── public/              # Services, portfolio, contact form, stats
│   ├── crm/                 # Admin-only leads + projects management
│   ├── booking/             # Slot availability + appointments
│   ├── notifications/       # In-app notification system
│   ├── analytics/           # Revenue, lead, booking, and growth analytics
│   ├── audit/               # Immutable audit log (who did what, when)
│   ├── client/              # Client-facing dashboard, projects, invoices
│   └── apikeys/             # API key issuance and verification
├── shared/
│   ├── auth.py              # ClerkAuth, APIKeyAuth, get_admin_user, get_current_user
│   ├── audit.py             # AuditAction enum + log_action helper
│   ├── cache.py             # cache_response decorator
│   ├── email.py             # Transactional email helpers
│   ├── exceptions.py        # Custom exceptions + Ninja handlers
│   ├── logging.py           # log_security_event helper
│   ├── middleware.py        # RequestIDMiddleware
│   ├── pagination.py        # Generic queryset paginator
│   ├── ratelimit.py         # Cache-based rate limiter + get_client_ip
│   ├── sanitize.py          # Input sanitization helpers
│   └── search.py            # Portfolio full-text search
├── tests/                   # Pytest test suite
├── .env.example
├── Makefile
├── requirements.txt
└── Procfile
```

---

## Local Setup

### Prerequisites
- Python 3.11+
- PostgreSQL database (Supabase free tier works) — or use SQLite for dev
- Clerk account (for JWT + webhooks)

### 1. Clone & enter the project

```bash
git clone https://github.com/your-org/nowic-backend.git
cd nowic-backend
```

### 2. Create and activate virtual environment

```bash
python -m venv venv

# Windows PowerShell
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in all values. See the **Environment Variables** table below.

### 5. Set settings module

```bash
# Windows PowerShell
$env:DJANGO_SETTINGS_MODULE = "core.settings.dev"

# macOS / Linux
export DJANGO_SETTINGS_MODULE=core.settings.dev
```

> **Dev shortcut:** `core.settings.dev` automatically switches to SQLite and console email — no Supabase or SMTP needed locally.

### 6. Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create superuser

```bash
python manage.py createsuperuser
```

### 8. Start development server

```bash
python manage.py runserver
```

### 9. Open interactive API docs

```
http://localhost:8000/api/docs
```

### 10. Run local quality gate

```bash
make qa
```

This runs:
- `python manage.py check` — Django system checks
- `flake8 . --count --statistics` — linting
- `isort --check-only .` — import order
- `pytest -q` — full test suite

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | Django secret key — generate with `python -c "import secrets; print(secrets.token_hex(50))"` |
| `DEBUG` | ✅ | `True` for dev, `False` for prod |
| `DJANGO_SETTINGS_MODULE` | ✅ | `core.settings.dev` or `core.settings.prod` |
| `DATABASE_URL` | ✅ | PostgreSQL connection string (e.g. from Supabase) |
| `CLERK_JWKS_URL` | ✅ | From Clerk Dashboard → API Keys → Advanced |
| `CLERK_WEBHOOK_SECRET` | ✅ | From Clerk Dashboard → Webhooks → Signing Secret |
| `CLERK_AUDIENCE` | ⚠️ | Expected JWT audience — skip verification if empty (not for prod) |
| `CLERK_ISSUER` | ⚠️ | Expected JWT issuer URL — skip verification if empty (not for prod) |
| `TRUST_X_FORWARDED_FOR` | ⚠️ | `True` on Railway / behind nginx proxy; `False` locally |
| `ALLOWED_HOSTS` | ✅ | Comma-separated hostnames, e.g. `your-app.railway.app` |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated CORS origins, e.g. `https://nowicstudio.in` |
| `EMAIL_HOST` | ✅ | SMTP host, default `smtp.gmail.com` |
| `EMAIL_PORT` | ✅ | SMTP port, default `587` |
| `EMAIL_HOST_USER` | ✅ | Gmail address |
| `EMAIL_HOST_PASSWORD` | ✅ | Gmail App Password (not your Google account password) |
| `ADMIN_EMAIL` | ✅ | Where contact/lead notifications are sent |
| `DEFAULT_FROM_EMAIL` | ✅ | Sender address shown in outgoing emails |
| `TEAM_MEMBERS_COUNT` | ✅ | Homepage stats value for "Team Members" |
| `CLOUDINARY_CLOUD_NAME` | ⚠️ | Cloudinary cloud name (for media uploads) |
| `CLOUDINARY_API_KEY` | ⚠️ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ⚠️ | Cloudinary API secret |
| `REDIS_URL` | ⚠️ | Redis connection URL — falls back to in-memory cache if empty |
| `SENTRY_DSN` | ⚠️ | Sentry DSN for error tracking (prod recommended) |

> ✅ = always required · ⚠️ = optional/conditional

---

## API Overview

### Public (no auth required)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/webhook/clerk/` | Clerk user lifecycle sync (Svix signature required) |
| `GET` | `/api/v1/public/services/` | List active service offerings |
| `GET` | `/api/v1/public/services/{slug}/` | Single service by slug |
| `GET` | `/api/v1/public/portfolio/` | List portfolio projects (filter: featured, category, search) |
| `GET` | `/api/v1/public/portfolio/{slug}/` | Single portfolio project |
| `POST` | `/api/v1/public/contact/` | Contact form submission (rate-limited: 3/hour per IP) |
| `GET` | `/api/v1/public/stats/` | Homepage statistics |
| `GET` | `/api/v1/booking/services/` | List bookable services |
| `GET` | `/api/v1/booking/slots/` | Available time slots for a date + service |
| `GET` | `/health/` | Health check (DB, cache, Celery) |

### User JWT required (any authenticated Clerk user)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/booking/book/` | Book an appointment |
| `GET` | `/api/v1/booking/mine/` | List my appointments (filter by status) |
| `POST` | `/api/v1/booking/cancel/{id}/` | Cancel an appointment |
| `GET` | `/api/v1/client/dashboard/` | Client dashboard summary |
| `GET` | `/api/v1/client/projects/` | Client's projects |
| `GET` | `/api/v1/client/projects/{id}/updates/` | Project update timeline |
| `GET` | `/api/v1/client/invoices/` | Client's invoices |
| `GET` | `/api/v1/notifications/` | In-app notifications |
| `POST` | `/api/v1/notifications/mark-all-read/` | Mark all notifications as read |
| `GET` | `/api/v1/notifications/unread-count/` | Unread notification count |

### Admin JWT required (role = admin)

| Method | Endpoint | Description |
|---|---|---|
| `GET / POST` | `/api/v1/crm/leads/` | List (paginated) / create leads |
| `GET / PATCH / DELETE` | `/api/v1/crm/leads/{id}/` | Get / update / soft-delete a lead |
| `GET` | `/api/v1/crm/projects/` | List all projects |
| `PATCH` | `/api/v1/crm/projects/{id}/` | Update project status / fields |
| `GET / PATCH` | `/api/v1/crm/submissions/` | List / update contact submissions |
| `PATCH` | `/api/v1/crm/submissions/{id}/` | Update single submission |
| `GET` | `/api/v1/crm/stats/` | CRM dashboard stats |
| `GET` | `/api/v1/admin/dashboard/` | Admin dashboard overview |
| `GET` | `/api/v1/admin/me/` | Current admin profile |
| `GET` | `/api/v1/admin/users/` | List all users |
| `PATCH` | `/api/v1/admin/users/{id}/` | Update user role / fields |
| `GET` | `/api/v1/admin/search/` | Global search across leads/projects |
| `GET` | `/api/v1/admin/audit-logs/` | Immutable audit log |
| `GET` | `/api/v1/analytics/revenue/` | Revenue analytics |
| `GET` | `/api/v1/analytics/leads/` | Lead funnel analytics |
| `GET` | `/api/v1/analytics/bookings/` | Booking analytics |
| `GET` | `/api/v1/analytics/growth/` | Growth trend data |
| `GET / POST` | `/api/v1/admin/api-keys/` | List / issue API keys |
| `DELETE` | `/api/v1/admin/api-keys/{id}/` | Revoke an API key |

Full interactive docs: `http://localhost:8000/api/docs` (dev only)

---

## Railway Deployment

### 1. Push to GitHub

```bash
git add .
git commit -m "production release"
git push origin main
```

### 2. Create Railway project

1. Go to [railway.app](https://railway.app) → **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your repository

### 3. Add environment variables

In Railway dashboard → **Variables**, add all keys from `.env.example`:

```
SECRET_KEY=...
DEBUG=False
DATABASE_URL=postgresql://...
CLERK_JWKS_URL=...
CLERK_WEBHOOK_SECRET=...
CLERK_AUDIENCE=...
CLERK_ISSUER=https://your-domain.clerk.accounts.dev
ALLOWED_HOSTS=your-app.railway.app
ALLOWED_ORIGINS=https://nowicstudio.in,http://localhost:5173
TRUST_X_FORWARDED_FOR=True
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
ADMIN_EMAIL=...
DEFAULT_FROM_EMAIL=...
TEAM_MEMBERS_COUNT=4
SENTRY_DSN=...
REDIS_URL=redis://...
DJANGO_SETTINGS_MODULE=core.settings.prod
```

### 4. Railway auto-detects Procfile

Railway will automatically use:
```
web: gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --workers 2
```

### 5. Run migrations via Railway CLI

```bash
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

---

## Deployment Checklist

Use this before every production release.

### Pre-deploy

```bash
make qa
```

Confirm:
- `CLERK_AUDIENCE` and `CLERK_ISSUER` are set in prod env (JWT will validate both)
- `TRUST_X_FORWARDED_FOR=True` is set — Railway sits behind a proxy
- `ALLOWED_HOSTS` has only real domains (no wildcard `*`)
- `SENTRY_DSN` is configured for error tracking
- `REDIS_URL` is set if Celery tasks are in use
- `CLOUDINARY_*` keys are set if media uploads are active
- `DEBUG=False` in production

### Deploy

```bash
railway up
railway run python manage.py migrate
```

### Post-deploy Smoke Tests

```bash
# Health check
GET /health/

# Public content
GET /api/v1/public/services/
GET /api/v1/public/stats/

# Booking slots (service-scoped)
GET /api/v1/booking/slots/?date=2099-01-01&service_id=1

# Contact form
POST /api/v1/public/contact/
{
  "name": "Smoke Test",
  "email": "test@example.com",
  "project_type": "Other",
  "message": "Smoke test submission"
}
```

Verify after deploy:
- Booking slots are service-scoped (different services have independent slot availability)
- Clerk-protected endpoints return `401` for invalid/expired tokens
- Admin endpoints return `403` for non-admin users
- Contact form rate limit triggers after 3 requests per IP per hour

### Rollback Plan

If an issue appears after deploy:

1. Roll back app version in Railway to the previous stable release.
2. Re-run smoke tests on the rolled-back version.
3. If a migration introduced incompatible schema changes, deploy a hotfix that supports both old and new schema before running forward-only migrations.
4. Keep `DATABASE_URL` snapshots before high-risk schema changes.

---

## Celery

### Run worker locally

```bash
celery -A core worker --loglevel=info
```

### Run beat scheduler (periodic tasks)

```bash
celery -A core beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

### Scheduled tasks

| Task | Schedule | Description |
|---|---|---|
| `apps.crm.tasks.send_followup_reminders` | Daily at 9:00 AM UTC | Sends follow-up reminder emails for active leads |
| `apps.booking.tasks.send_24hr_reminders` | Daily at 10:00 AM UTC | Sends 24-hour booking reminder emails to clients |
| `apps.analytics.tasks.snapshot_today` | Daily at 11:55 PM UTC | Saves nightly analytics snapshot to the database |

> Without Redis/Celery configured, these tasks will not run. All other API functionality remains unaffected.

---

## Clerk Webhook Setup

1. Clerk Dashboard → **Webhooks** → **Add Endpoint**
2. URL: `https://your-app.railway.app/api/webhook/clerk/`
3. Events: `user.created`, `user.updated`, `user.deleted`
4. Copy the **Signing Secret** → set as `CLERK_WEBHOOK_SECRET`

---

## Gmail SMTP Setup

1. Google Account → Security → **2-Step Verification** (must be ON)
2. Google Account → Security → **App Passwords**
3. Create app password for "Mail" → copy the 16-character password
4. Set as `EMAIL_HOST_PASSWORD` in `.env` (not your Google account password)
