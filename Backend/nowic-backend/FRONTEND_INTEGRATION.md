# Frontend Integration Guide

Complete reference for connecting the React + Vite frontend to the Nowic Studio backend API.

---

## Section 1 — Frontend Environment Variables

Create `.env.local` in your Vite project root:

```env
# Development
VITE_API_BASE_URL=http://localhost:8000

# Production (update after Railway deploy)
# VITE_API_BASE_URL=https://your-app.railway.app
```

Use in your code:

```js
const BASE_URL = import.meta.env.VITE_API_BASE_URL
```

---

## Section 2 — JavaScript Fetch Examples

### Services Page

```js
// Fetch all active services
const res = await fetch(`${BASE_URL}/api/v1/public/services/`)
const { success, data } = await res.json()
// data = [{ id, name, slug, tagline, description, features, icon_name, price_starting, ... }]

// Fetch single service by slug
const res = await fetch(`${BASE_URL}/api/v1/public/services/web-development/`)
const { data: service } = await res.json()
```

### Portfolio Page

```js
// All projects
const res = await fetch(`${BASE_URL}/api/v1/public/portfolio/`)
const { data, total } = await res.json()

// Featured only
const res = await fetch(`${BASE_URL}/api/v1/public/portfolio/?featured=true`)

// Filter by category (ai | saas | ecommerce | web | mobile)
const res = await fetch(`${BASE_URL}/api/v1/public/portfolio/?category=saas`)

// Single project
const res = await fetch(`${BASE_URL}/api/v1/public/portfolio/my-project-slug/`)
```

### Contact Form

```js
const res = await fetch(`${BASE_URL}/api/v1/public/contact/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    project_type: 'SaaS MVP',
    message: 'I need a custom web app built in 4 weeks...'
  })
})

const data = await res.json()

if (data.success) {
  // Show: "We will get back within 24 hours!"
} else if (res.status === 429) {
  // data.retry_after = seconds until rate limit resets
  console.log(`Rate limited. Retry in ${data.retry_after}s`)
}
```

### Homepage Stats

```js
const res = await fetch(`${BASE_URL}/api/v1/public/stats/`)
const { data } = await res.json()
// data = {
//   projects_delivered: 42,
//   happy_clients: 38,
//   services_offered: 6,
//   team_members: 4
// }
```

---

## Section 3 — Authenticated Requests (Clerk)

### Setup

```jsx
// Install Clerk React SDK
// npm install @clerk/clerk-react

// In your App or layout
import { ClerkProvider } from '@clerk/clerk-react'

<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
  <App />
</ClerkProvider>
```

### Auth Helper Hook

```js
// hooks/useApi.js
import { useAuth } from '@clerk/clerk-react'

export function useApi() {
  const { getToken } = useAuth()

  const authFetch = async (url, options = {}) => {
    const token = await getToken()
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })
  }

  return { authFetch }
}
```

### Check Available Booking Slots (public)

```js
const date = '2024-03-15'
const serviceId = 1

const res = await fetch(
  `${BASE_URL}/api/v1/booking/slots/?date=${date}&service_id=${serviceId}`
)
const { data } = await res.json()
// data = { date: "2024-03-15", available: ["10:00", "11:00", "14:00"] }
```

### Book an Appointment (requires auth)

```js
const { authFetch } = useApi()

const res = await authFetch(`${BASE_URL}/api/v1/booking/book/`, {
  method: 'POST',
  body: JSON.stringify({
    service_id: 1,
    date: '2024-03-15',
    time_slot: '10:00'
  })
})

const data = await res.json()
// data.success = true → appointment booked + confirmation email sent
// res.status 409 → slot already taken
```

### Get My Appointments (requires auth)

```js
const { authFetch } = useApi()

// All appointments
const res = await authFetch(`${BASE_URL}/api/v1/booking/mine/`)

// Filter by status (pending | confirmed | cancelled)
const res = await authFetch(`${BASE_URL}/api/v1/booking/mine/?status=confirmed`)

const { data } = await res.json()
// data = [{ id, service_id, date, time_slot, status, booked_at, ... }]
```

### Cancel an Appointment (requires auth)

```js
const { authFetch } = useApi()

const res = await authFetch(`${BASE_URL}/api/v1/booking/cancel/42/`, {
  method: 'POST',
  body: JSON.stringify({ reason: 'Schedule conflict' })
})

const data = await res.json()
// { success: true, message: "Booking cancelled" }
// res.status 409 → cannot cancel past booking
```

---

## Section 4 — API Response Format Reference

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Human-readable description",
  "code": "ERROR_CODE"
}
```

### Error Codes

| HTTP Status | Code | Trigger |
|---|---|---|
| `401` | — | Missing/invalid JWT (auto by Ninja) |
| `403` | `FORBIDDEN` | Not an admin, or missing role |
| `404` | `NOT_FOUND` | Resource does not exist |
| `409` | `CONFLICT` | Slot taken, booking already cancelled |
| `422` | — | Validation error (bad request body) |
| `429` | `RATE_LIMITED` | Too many contact/booking requests |

### Rate Limit Response (429)

```json
{
  "success": false,
  "error": "Too many requests",
  "code": "RATE_LIMITED",
  "retry_after": 3542
}
```

### Paginated Response (CRM endpoints)

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total": 47,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## Section 5 — All Endpoint Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/webhook/clerk/` | Svix | Clerk user lifecycle |
| `GET` | `/api/v1/public/services/` | None | List services |
| `GET` | `/api/v1/public/services/{slug}/` | None | Single service |
| `GET` | `/api/v1/public/portfolio/` | None | List portfolio |
| `GET` | `/api/v1/public/portfolio/{slug}/` | None | Single project |
| `POST` | `/api/v1/public/contact/` | None | Submit contact form |
| `GET` | `/api/v1/public/stats/` | None | Homepage stats |
| `GET` | `/api/v1/crm/leads/` | Admin | List leads (paginated) |
| `POST` | `/api/v1/crm/leads/` | Admin | Create lead |
| `GET` | `/api/v1/crm/leads/{id}/` | Admin | Get lead |
| `PATCH` | `/api/v1/crm/leads/{id}/` | Admin | Update lead |
| `DELETE` | `/api/v1/crm/leads/{id}/` | Admin | Soft-delete lead |
| `GET` | `/api/v1/crm/projects/` | Admin | List projects |
| `PATCH` | `/api/v1/crm/projects/{id}/` | Admin | Update project |
| `GET` | `/api/v1/crm/submissions/` | Admin | List submissions |
| `PATCH` | `/api/v1/crm/submissions/{id}/` | Admin | Update submission |
| `GET` | `/api/v1/crm/stats/` | Admin | CRM dashboard stats |
| `GET` | `/api/v1/booking/services/` | None | Booking services |
| `GET` | `/api/v1/booking/slots/` | None | Available slots |
| `POST` | `/api/v1/booking/book/` | User | Create appointment |
| `GET` | `/api/v1/booking/mine/` | User | My appointments |
| `POST` | `/api/v1/booking/cancel/{id}/` | User | Cancel appointment |

---

## Section 6 — CORS

The backend is already configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `https://nowicstudio.in` (production frontend)

If you need to add more origins, update `ALLOWED_ORIGINS` in your `.env`.
