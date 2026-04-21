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
| Email | Django SMTP (Gmail App Password) |
| Deploy | Railway.app + Gunicorn |

---

## Project Structure

```
nowic-backend/
├── core/                   # Django project config
│   ├── settings/
│   │   ├── base.py         # Shared settings
│   │   ├── dev.py          # Development overrides
│   │   └── prod.py         # Production hardening
│   ├── api.py              # NinjaAPI root + router wiring
│   └── urls.py             # URL conf
├── apps/
│   ├── users/              # Clerk webhook sync → UserProfile
│   ├── public/             # Services, portfolio, contact, stats
│   ├── crm/                # Admin-only leads + projects
│   └── booking/            # Slot availability + appointments
├── shared/
│   ├── auth.py             # ClerkAuth, get_admin_user, get_current_user
│   ├── email.py            # Transactional email helpers
│   ├── exceptions.py       # Custom exceptions + Ninja handlers
│   ├── pagination.py       # Generic queryset paginator
│   └── ratelimit.py        # Cache-based rate limiter
├── .env.example
├── requirements.txt
└── Procfile
```

---

## Local Setup

### Prerequisites
- Python 3.11+
- PostgreSQL database (Supabase free tier works)
- Clerk account (for JWT + webhooks)

### 1. Clone & enter the project

```bash
git clone https://github.com/your-org/nowic-backend.git
cd nowic-backend
```

### 2. Create and activate virtual environment

```bash
python -m venv venv

# Windows
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

Open `.env` and fill in all values:

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key (generate with `python -c "import secrets; print(secrets.token_hex(50))"`) |
| `DATABASE_URL` | PostgreSQL connection string from Supabase |
| `CLERK_JWKS_URL` | From Clerk dashboard → API Keys → Advanced |
| `CLERK_WEBHOOK_SECRET` | From Clerk dashboard → Webhooks |
| `CLERK_AUDIENCE` | Expected JWT audience from Clerk |
| `CLERK_ISSUER` | Expected JWT issuer URL from Clerk |
| `EMAIL_HOST_USER` | Gmail address |
| `EMAIL_HOST_PASSWORD` | Gmail App Password (not your account password) |
| `ADMIN_EMAIL` | Where contact/lead notifications go |
| `TEAM_MEMBERS_COUNT` | Homepage stats value for team members |

### 5. Set settings module

```bash
# Windows PowerShell
$env:DJANGO_SETTINGS_MODULE = "core.settings.dev"

# macOS / Linux
export DJANGO_SETTINGS_MODULE=core.settings.dev
```

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
- `python manage.py check`
- `flake8` + `isort --check-only`
- full test suite (`pytest -q`)

---

## Railway Deployment

### 1. Push to GitHub

```bash
git add .
git commit -m "initial backend"
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
CLERK_ISSUER=...
ALLOWED_HOSTS=your-app.railway.app
ALLOWED_ORIGINS=https://nowicstudio.in,http://localhost:5173
TRUST_X_FORWARDED_FOR=True
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
ADMIN_EMAIL=...
DEFAULT_FROM_EMAIL=...
TEAM_MEMBERS_COUNT=4
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

Use this for every production release.

### Pre-deploy

```bash
python manage.py check
python -m pytest -q
```

Confirm:
- `CLERK_AUDIENCE` and `CLERK_ISSUER` are set in prod env
- `ALLOWED_HOSTS` has only real domains (no wildcard)
- `TRUST_X_FORWARDED_FOR=True` only when behind trusted proxy
- `TEAM_MEMBERS_COUNT` is configured as expected

### Deploy

```bash
railway up
railway run python manage.py migrate
```

### Post-deploy Smoke Tests

Check these endpoints:
- `GET /api/health/`
- `GET /api/v1/public/services/`
- `GET /api/v1/public/stats/`
- `GET /api/v1/booking/slots/?date=2099-01-01&service_id=<id>`

Verify:
- Booking slots are service-scoped
- CRM/public stats and services return fresh data after admin updates
- Clerk-protected endpoints return 401 for invalid/expired tokens

### Rollback Plan

If issue appears after deploy:

1. Roll back app version in Railway to previous stable release.
2. Re-run smoke tests on rolled-back version.
3. If migration introduced incompatible schema assumptions, deploy hotfix code that supports both old/new schema before running forward-only migration changes.
4. Keep backup of `DATABASE_URL` snapshots before high-risk schema changes.

---

## API Overview

| Prefix | Auth | Description |
|---|---|---|
| `POST /api/webhook/clerk/` | Svix sig | Clerk user lifecycle sync |
| `GET /api/v1/public/services/` | None | Active service offerings |
| `GET /api/v1/public/portfolio/` | None | Portfolio projects |
| `POST /api/v1/public/contact/` | None | Contact form (rate-limited) |
| `GET /api/v1/public/stats/` | None | Homepage statistics |
| `GET /api/v1/crm/leads/` | Admin JWT | CRM lead list |
| `GET /api/v1/crm/stats/` | Admin JWT | Full dashboard stats |
| `GET /api/v1/booking/slots/` | None | Available time slots |
| `POST /api/v1/booking/book/` | User JWT | Book an appointment |
| `GET /api/v1/booking/mine/` | User JWT | User's appointments |

Full interactive docs: `/api/docs`

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
3. Create app password for "Mail" → copy the 16-char password
4. Set as `EMAIL_HOST_PASSWORD` (not your Google account password)
