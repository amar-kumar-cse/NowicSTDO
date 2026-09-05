# 🧠 Nowic Studio Codebase Brain File

This file serves as a single source of truth for the codebase architecture, folder structure, database models, configurations, API endpoints, and critical details. Refer to this file to avoid re-scanning the entire codebase, saving AI tokens and developer time.

---

## 🏗️ Architecture Overview

The application is structured as a decoupled **Frontend-Backend** application:
- **Backend:** Django with Django Ninja (FastAPI-like REST API), SQLite database, and Clerk authentication integration.
- **Frontend:** Vite React application built with Tailwind CSS, Framer Motion, and Lucide icons.
- **Authentication:** Clerk Auth handles user authentication, synchronization with Django, and role-based permissions (Client vs. Admin).

---

## 📂 Core Folder Structure

### Frontend (`/frontend`)
- **`src/main.jsx` & `src/App.jsx`:** Main entry points, React routes, and lazy loading definitions.
- **`src/lib/api.js`:** Central API communication interface. Defines backend base URL (`BASE_URL`), authenticated/public API wrappers, and the `resolveImageUrl()` utility.
- **`src/context/ContentContext.jsx`:** Loads CMS sections (`brand`, `stats`, `services`, `portfolio`, `faqs`, `reviews`) during startup and provides them globally.
- **`src/components/`:**
  - `reveal/Preloader.jsx`: Page loading splash screen displaying the custom spinner (runs for exactly `2.0s`).
  - `LoadingSpinner.jsx`: Custom letter-based spinner animation displaying a glowing wave: `G N I D A O L` (retro spell loop).
  - `common/Navbar.jsx` & `Footer.jsx`: Global navigation. Footer loads services dynamically from the CMS.
- **`src/pages/`:**
  - Public pages: `Home.jsx`, `Services.jsx`, `Portfolio.jsx`, `About.jsx`, `Contact.jsx`, `Booking.jsx`, `SubmitReview.jsx` (accessible at `/review`).
  - Admin pages (`src/pages/admin/`): `Dashboard.jsx`, `ReviewsManagement.jsx`, `ServicesEditor.jsx`, `PortfolioEditor.jsx`, `BrandEditor.jsx`, `AboutEditor.jsx`, etc.

### Backend (`/Backend/nowic-backend`)
- **`core/`:** Django settings, main WSGI/ASGI configurations, and central `api.py` router mounting sub-routers.
- **`shared/`:** Core middlewares, auth handlers (Clerk auth logic), custom exception definitions, audit logging helpers, and email dispatch utils.
- **`apps/`:** Subdivided Django apps:
  - `users`: Clerk user sync, role-based metadata (Admin vs. Client), and `UserProfile` model.
  - `public`: Handle public submissions. Models: `CustomerReview`, `ContactSubmission`, `PortfolioItem`.
  - `booking`: Appointment system. Models: `BookingService`, `Appointment`.
  - `crm`: Content Management (CMS) & Lead pipelines. Models: `SiteContent` (stores JSON sections for the CMS), `Lead`, `Project`, `ProjectUpdate`, `ProjectFile`, `Invoice`.
  - `notifications`: In-app notification triggers and SSE streaming endpoints for real-time dashboard events.
  - `analytics`: DB metrics, growth rates, bookings, and revenue charts generation.
  - `apikeys` & `audit`: Audit trails and developer API Key generation.

---

## 🔐 Auth & Role System

1. **Clerk Auth Sync:** Frontend sends Clerk JWT Bearer tokens in headers.
2. **Auth Verification:** Backend validates Clerk tokens in `shared/auth.py`. 
3. **Role Checks:** User Roles (`admin` or `client`) are sync'd from Clerk public metadata to backend profile.
   - Admin routes require `clerk_auth` + user profile check for `is_staff` or `role == 'admin'`.

---

## 🌐 Endpoint Map (Django Ninja Routers)

Main API Entry point: `/api/v1/`

### Public Endpoints (`apps/public/api.py`, `apps/booking/api.py`)
- `GET /public/portfolio/` & `GET /public/portfolio/{slug}/` (Portfolio Showcase)
- `POST /public/contact/` (Contact Form Submission)
- `GET /public/reviews/` (Fetch APPROVED reviews only)
- `POST /public/reviews/` (Submit new client review)
- `GET /booking/services/` (List active Booking Services)
- `GET /booking/slots/` (Get available dates/slots)

### Client Endpoints (`apps/client/api.py`, `apps/booking/api.py`)
- `POST /booking/book/` (Book a slots consultation)
- `GET /booking/mine/` (Get personal appointments)
- `POST /booking/cancel/{id}/` (Cancel own appointment)
- `GET /client/dashboard/` (Client specific project status)
- `GET /client/projects/` (Active projects client belongs to)
- `GET /client/invoices/` (Own invoices)

### Admin Endpoints (`apps/crm/admin_api.py`, etc.)
- `GET /admin/site-content/{section}/` & `PUT /admin/site-content/{section}/` (CMS Sections update/read)
- `GET /admin/users/` (User roles / details)
- `GET /admin/reviews/` & `PATCH /admin/reviews/{id}/` (Approve/Reject submitted reviews)
- `GET/POST/PATCH /admin/invoices/` (Invoicing pipeline)
- `GET/POST/PATCH /admin/projects/` (Client workspaces management)

---

## 🖼️ Media & Image Upload Handling

- Backend serves static files uploaded to the local `media/` directory during dev.
- **Frontend Utility:** Always wrap image URLs in the frontend using `resolveImageUrl(path)` from `src/lib/api.js`.
  - Maps relative backend media links (e.g., `/media/services/image.png`) to fully qualified URLs (e.g., `http://127.0.0.1:8000/media/services/image.png`).

---

## 📂 Key Models (SQLite Database)

### 1. `apps/public/models.py:CustomerReview`
- **Fields:** `client_name`, `role`, `company`, `rating` (int), `review_text`, `avatar` (ImageField), `is_approved` (boolean).
- **Behavior:** Submitted through `/review` publicly. Visible on Homepage *only* when `is_approved=True` (approved via Admin Reviews panel).

### 2. `apps/crm/models.py:SiteContent`
- **Fields:** `section_name` (slug), `data` (JSON field).
- **Behavior:** Main store for all website copy (about details, brand tags, features list, portfolio items, stats). Loaded by `ContentContext.jsx`.

### 3. `apps/booking/models.py:BookingService`
- **Fields:** `name`, `slug`, `description`, `duration_minutes`, `price`, `is_active`.
- **Relationship:** Used in booking appointments. Must match the visual service list.

---

## 💡 Common Developer Workflows

### How to Run Locally
1. **Backend Server:**
   ```powershell
   cd Backend/nowic-backend
   ..\.venv\Scripts\python manage.py runserver
   ```
2. **Frontend Server:**
   ```powershell
   cd frontend
   npm run dev
   ```

### CSS System (`frontend/src/index.css`)
- Contains Tailwind directives and custom animation styles at the bottom, including the custom loader transitions, custom cursors logic, glassmorphic layout assets, and gradients.

---

## 🕒 Recent Critical Fixes & Features Added

1. **Custom Spinner Loader (G N I D A O L):**
   - Replaced default tailwind round spinner in `LoadingSpinner.jsx` with a retro letters wave spelling "LOADING" backwards (`G N I D A O L`).
   - CSS logic in `index.css` is bounded under `.custom-loader` with `600px` default width (scaled to `scale(0.4)` by default) to keep spacing math perfect and prevent letter overlapping.
2. **Homepage Empty Testimonials State:**
   - Modified `Home.jsx` so that the Reviews/Testimonials section stays visible even if the database has 0 approved reviews, showing a beautiful empty state panel and keeping the "Leave a Review" button accessible.
3. **Preloader Animation Sync:**
   - Preloader timeout in `Preloader.jsx` was fine-tuned to exactly `2.0 seconds` (2000ms) to sync with the loader wave period without lagging user entry.
4. **Footer Dynamic Services Sync:**
   - Replaced hardcoded services list in `Footer.jsx` with dynamic content mapping from CMS (`content.services`), ensuring any updates from the admin dashboard reflect automatically in the Footer.
5. **CMS Image Resolution:**
   - Standardized CMS dashboard file uploads using `resolveImageUrl` in admin screens (`ServicesEditor`, `PortfolioEditor`, etc.) to prevent media loading breaks when switching domains.
