# Nowic Studio — Corrected SEO + AEO/GEO Optimization Plan

> **Status:** Rewritten from scratch to match the ACTUAL website (not the generic template)
> **Date:** August 2026
> **Website:** https://nowicstdio.tech/

---

## 0. EXECUTIVE SUMMARY

The original 27-phase plan was a **generic SEO template** that proposed services Nowic Studio doesn't offer (Flutter, Android, iOS, SEO-as-a-service, UI/UX design as standalone, etc.) and would have created 50+ thin pages for a 6-service boutique agency.

This corrected plan is built from a **real audit of the actual codebase**:

- **Frontend:** React + Vite + Tailwind CSS (SPA on Vercel)
- **Backend:** Django + Django Ninja REST API (on Render)
- **CMS:** Full admin panel (services, portfolio, blog, reviews, site content)
- **Actual services:** MVP Development, Business Websites, AI Web Apps, Admin Dashboards, SaaS Platforms, API & Backend
- **Actual tech stack:** React, Next.js, Vite, TypeScript, Django, Node.js, PostgreSQL, Supabase, OpenAI, Claude, LangChain, Stripe, Razorpay, Clerk, Auth.js, Vercel, Render, Docker, GitHub Actions

### What already works well (KEEP):
- SEO component with Helmet (title, description, canonical, robots, OG, Twitter, JSON-LD)
- AI-crawler-friendly robots.txt (GPTBot, ClaudeBot, PerplexityBot, Google-Extended all allowed)
- llms.txt + llms-full.txt (structured knowledge for AI crawlers)
- Security headers via vercel.json (HSTS, X-Frame-Options, CSP, etc.)
- GA4 analytics with conversion event tracking (contact submit, CTA clicks, form start)
- Schema.org structured data on every page
- Full admin CMS for content management
- Dynamic sitemap.py in backend (but static file is deployed — needs fixing)

### What's broken or missing (FIX/CREATE):
- Static sitemap.xml doesn't include blog posts or dynamic content (backend generator exists; static file currently deployed)
- No individual service landing pages (API has `getServiceBySlug` but no frontend route)
- No detailed case study pages (only expandable cards)
- Technology hub: admin-editable and seeded; frontend reads remote content with a static fallback (needs review and canonical pages)
- Blog content: initial posts seeded via scripts; may need publishing in admin for live inclusion
- No industry/solution pages
- Minimal internal linking
- hreflang tags: implemented in the SEO component (verify in production)
- Favicon: referenced in `index.html` (implemented)

---

## 1. CURRENT WEBSITE ARCHITECTURE

### Existing Routes (from `App.jsx`):
| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Home | ✅ Good |
| `/services` | Services grid (CMS-driven) | ⚠️ Single page, no individual service URLs |
| `/portfolio` | Portfolio grid | ⚠️ No individual project pages |
| `/case-studies` | Case studies grid | ⚠️ No individual case study URLs |
| `/pricing` | Pricing tiers | ✅ Good |
| `/about` | About page | ✅ Good |
| `/contact` | Contact form | ✅ Good |
| `/booking` | Calendar booking | ✅ Good |
| `/dashboard` | Client dashboard | ✅ Good |
| `/review` | Submit review | ✅ Good |
| `/technologies` | Technology hub (admin-driven) | ⚠️ Admin-editable; detail pages available via frontend fallback |
| `/blog` | Blog list | ⚠️ Initial posts seeded; may need publishing in admin |
| `/blog/:slug` | Blog post detail | ✅ Infrastructure ready |
| `/privacy-policy` | Privacy policy | ✅ Good |
| `/admin/*` | Admin CMS | ✅ Good (blocked from indexing) |

### Existing Services (from `content.js` + `llms-full.txt`):
1. **MVP Development** — $2,499, 4-6 weeks
2. **Business Websites** — $1,499, 1-2 weeks
3. **AI Web Apps** — $3,999, 2-3 weeks
4. **Admin Dashboards** — Custom quote
5. **SaaS Platforms** — $5,999, 6-8 weeks
6. **API & Backend** — Custom quote

### Existing Tech Stack (from `llms-full.txt`):
- **Frontend:** React, Next.js, Vite, TypeScript, Tailwind CSS, Framer Motion, Zustand/Redux
- **Backend:** Python, Django, Django Ninja, Node.js, Express.js, FastAPI, Celery
- **Databases:** PostgreSQL, Supabase, SQLite, Redis, MongoDB, Pinecone, pgvector
- **AI/ML:** OpenAI GPT-4/4o, Anthropic Claude, LangChain, Pinecone, pgvector, Hugging Face
- **DevOps:** Vercel, Render, Docker, GitHub Actions, Cloudflare, AWS S3
- **Auth:** Clerk, Auth.js, JWT, OAuth
- **Payments:** Stripe, Razorpay

### Existing Portfolio (4 projects):
1. Event Ticket Booking System (Full-Stack Platform) — React, Node.js, PostgreSQL, Stripe
2. Catering Services Website (Business Website) — React, SEO, CMS, Framer Motion
3. Siya AI — Assistant Platform (AI Web Application) — LLM, OpenAI, Dashboards, RBAC
4. BloodConnect (Healthcare Platform) — React, MongoDB, Maps API, Healthcare

### Existing SEO Infrastructure:
- **SEO component** (`SEO.jsx`): Helmet-based, handles title/description/canonical/robots/OG/Twitter/schema
- **robots.txt**: Allows all major crawlers + AI bots (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot, FacebookBot). Blocks /admin, /dashboard, /review.
- **sitemap.xml**: **STATIC** — only 8 core pages. Does NOT include blog posts or dynamic content.
- **sitemap.py** (backend): Dynamic generator that includes blog posts and services, but uses `/services#slug` anchor links instead of individual pages.
- **llms.txt / llms-full.txt**: Comprehensive structured knowledge files for AI crawlers.
- **vercel.json**: SPA rewrites, security headers, cache headers for assets/sitemap/robots.
- **Analytics.jsx**: GA4 with conversion tracking (contact submit, CTA clicks, form start, booking submit, portfolio clicks, pricing clicks).
- **Schema.org**: Organization, WebSite, ProfessionalService, Service, BreadcrumbList, FAQPage, Blog, BlogPosting, CollectionPage, ContactPage, AboutPage, Article on respective pages.

---

## 2. AUDIT: WHAT EXISTS, WHAT'S CORRECT, WHAT'S MISSING

### 2.1 What Already Exists (KEEP)

| Item | File | Status |
|------|------|--------|
| SEO component with Helmet | `frontend/src/components/SEO.jsx` | ✅ KEEP — comprehensive, well-structured |
| robots.txt with AI crawler rules | `frontend/public/robots.txt` | ✅ KEEP — allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended |
| llms.txt (AI knowledge file) | `frontend/public/llms.txt` | ✅ KEEP — concise, accurate |
| llms-full.txt (extended knowledge) | `frontend/public/llms-full.txt` | ✅ KEEP — detailed, accurate |
| Security headers | `frontend/vercel.json` | ✅ KEEP — HSTS, X-Frame-Options, CSP, etc. |
| GA4 analytics with conversion tracking | `frontend/src/components/Analytics.jsx` | ✅ KEEP — tracks contact submits, CTA clicks, form starts |
| Schema.org structured data | All page components | ✅ KEEP — Organization, Service, BreadcrumbList, FAQPage, BlogPosting |
| Admin CMS | Backend + admin pages | ✅ KEEP — full content management |
| Blog infrastructure | `Blog.jsx`, `BlogPostDetail.jsx`, `BlogPost` model | ✅ KEEP — ready for content |
| Portfolio infrastructure | `Portfolio.jsx`, `PortfolioProject` model | ✅ KEEP — ready for projects |
| Contact form with validation | `Contact.jsx` | ✅ KEEP — rate limiting, honeypot, GA4 tracking |
| Booking system | `Booking.jsx` | ✅ KEEP — calendar scheduling |
| Dynamic sitemap generator | `Backend/apps/public/sitemap.py` | ✅ KEEP — but needs to be deployed instead of static file |

### 2.2 What Is Correct (KEEP AS-IS)

| Item | Reason |
|------|--------|
| Homepage hero with clear value prop | "AI-Powered Software Agency" + "MVPs, AI web apps, business websites and dashboards" |
| Services grid with 6 actual services | Matches real offerings, CMS-driven |
| Pricing page with 3 tiers | Clear, transparent, matches actual pricing |
| About page with timeline and values | Authentic, no fake claims |
| Contact form with project type dropdown | Matches actual service taxonomy |
| Footer with social links and contact info | Consistent brand identity |
| Navigation (Home, Services, Portfolio, About, Contact) | Simple, user-friendly |
| Dark theme with mint accent | Consistent brand design |
| Mobile-responsive design | Tailwind CSS responsive utilities |
| Client-side routing with React Router | SPA architecture |

### 2.3 What Is Missing (CREATE/IMPROVE)

| Item | Priority | Action |
|------|----------|--------|
| Individual service landing pages | **P1** | CREATE — `/services/mvp-development`, `/services/saas-platforms`, etc. |
| Individual case study pages | **P1** | CREATE — `/case-studies/:slug` with full detail |
| Individual portfolio project pages | **P1** | CREATE — `/portfolio/:slug` with full detail |
| Technology pages | **P2** | CREATE — `/technologies/react`, `/technologies/django`, etc. |
| Blog content | **P1** | CREATE — publish first 5-8 articles |
| Industry pages | **P2** | CREATE — `/industries/startups`, `/industries/healthcare` (only for industries with real projects) |
| Solutions/use case pages | **P2** | CREATE — `/solutions/mvp-for-startups`, `/solutions/ai-integration` |
| Dynamic sitemap deployment | **P0** | FIX — deploy backend sitemap.py instead of static file |
| hreflang tags | **P2** | IMPROVE — add hreflang="en-IN" and hreflang="en" |
| Internal linking | **P1** | IMPROVE — add contextual links between pages |
| Favicon | **P1** | CREATE — add favicon to index.html |
| 404 page with SEO | **P1** | IMPROVE — add SEO meta tags and helpful links |
| Image optimization | **P2** | IMPROVE — add WebP/AVIF, proper alt text, lazy loading |
| Structured data for portfolio items | **P2** | IMPROVE — add CreativeWork schema to individual project pages |
| Structured data for case studies | **P2** | IMPROVE — add Article/CreativeWork schema |
| Structured data for technology pages | **P2** | IMPROVE — add TechArticle schema |
| Breadcrumb navigation | **P1** | IMPROVE — add breadcrumb component to all pages |
| Search functionality | **P3** | OPTIONAL — add blog/portfolio search |

### 2.4 What Should NOT Be Changed (DO NOT TOUCH)

| Item | Reason |
|------|--------|
| Existing service taxonomy (6 services) | Matches actual offerings |
| Tech stack references in llms.txt/llms-full.txt | Accurate and comprehensive |
| Pricing structure | Matches actual pricing |
| Contact form fields and validation | Working well with GA4 tracking |
| robots.txt AI crawler rules | Already correctly configured |
| vercel.json security headers | Properly configured |
| GA4 tracking ID and event structure | Working correctly |
| Admin CMS structure | Fully functional |
| Dark theme design system | Consistent and professional |
| Navigation structure | Simple and user-friendly |

---

## 3. RECOMMENDED INFORMATION ARCHITECTURE

### 3.1 URL Structure

```
/
├── /about                          [EXISTS] About page
├── /services                       [EXISTS] Services overview
│   ├── /services/mvp-development   [CREATE] Individual service page
│   ├── /services/business-websites [CREATE] Individual service page
│   ├── /services/ai-web-apps       [CREATE] Individual service page
│   ├── /services/admin-dashboards  [CREATE] Individual service page
│   ├── /services/saas-platforms    [CREATE] Individual service page
│   └── /services/api-backend       [CREATE] Individual service page
├── /portfolio                      [EXISTS] Portfolio grid
│   └── /portfolio/:slug            [CREATE] Individual project page
├── /case-studies                   [EXISTS] Case studies grid
│   └── /case-studies/:slug         [CREATE] Individual case study page
├── /technologies                   [CREATE] Technology hub
│   ├── /technologies/react         [CREATE]
│   ├── /technologies/nextjs        [CREATE]
│   ├── /technologies/django        [CREATE]
│   ├── /technologies/nodejs        [CREATE]
│   ├── /technologies/postgresql    [CREATE]
│   ├── /technologies/supabase      [CREATE]
│   ├── /technologies/openai        [CREATE]
│   └── /technologies/langchain     [CREATE]
├── /industries                     [CREATE] Industries hub
│   ├── /industries/startups        [CREATE] (has real projects)
│   └── /industries/healthcare      [CREATE] (BloodConnect project)
├── /solutions                      [CREATE] Solutions hub
│   ├── /solutions/mvp-for-startups [CREATE]
│   ├── /solutions/ai-integration   [CREATE]
│   └── /solutions/saas-platform    [CREATE]
├── /blog                           [EXISTS] Blog list
│   └── /blog/:slug                 [EXISTS] Blog post detail
├── /pricing                        [EXISTS] Pricing page
├── /faqs                           [CREATE] Consolidated FAQs
├── /contact                        [EXISTS] Contact page
├── /booking                        [EXISTS] Booking page
└── /privacy-policy                 [EXISTS] Privacy policy
```

### 3.2 Navigation (Updated)

**Primary Nav:**
- Home
- Services
- Portfolio
- Case Studies
- Technologies
- Blog
- About
- Contact

**Footer Nav:**
- Services (list all 6)
- Portfolio (link to portfolio + case studies)
- Technologies (list key tech)
- Industries (list available)
- Solutions (list available)
- Blog
- About
- Contact
- Privacy Policy

---

## 4. SERVICE ARCHITECTURE

### 4.1 Current Services (KEEP — these are real)

| Service | Slug | Starting Price | Timeline | Key Tech |
|---------|------|----------------|----------|----------|
| MVP Development | `mvp-development` | $2,499 | 4-6 weeks | React, Next.js, Django, PostgreSQL, Clerk |
| Business Websites | `business-websites` | $1,499 | 1-2 weeks | React, Next.js, Tailwind CSS, Vercel |
| AI Web Apps | `ai-web-apps` | $3,999 | 2-3 weeks | OpenAI, Claude, LangChain, Pinecone, pgvector |
| Admin Dashboards | `admin-dashboards` | Custom | 2-4 weeks | React, Django, PostgreSQL, Chart.js |
| SaaS Platforms | `saas-platforms` | $5,999 | 6-8 weeks | React, Next.js, Django, Stripe, PostgreSQL |
| API & Backend | `api-backend` | Custom | 2-4 weeks | Django Ninja, Node.js, Express, PostgreSQL, Redis |

### 4.2 Service Page Template (for each of the 6)

Each service page must include:
1. **Hero** — Clear H1 with service name, compelling subheading
2. **What is [Service]?** — Plain-language explanation
3. **Who needs this?** — Target audience (startups, SMBs, enterprises)
4. **Problems it solves** — Specific pain points addressed
5. **Our approach** — Development process (Discovery → Design → Build → Launch)
6. **Technology stack** — Specific tools used for this service
7. **Features included** — Bullet list of deliverables
8. **Security considerations** — Auth, data protection, compliance
9. **Performance considerations** — Speed, scalability, monitoring
10. **Typical project workflow** — Timeline breakdown
11. **Relevant portfolio** — Links to related case studies/projects
12. **FAQs** — 5-8 service-specific questions
13. **CTA** — "Book a Free Discovery Call" + "Start a Project"
14. **Schema.org** — Service + BreadcrumbList + FAQPage JSON-LD

### 4.3 Services NOT to create (DO NOT CREATE)

The original plan proposed these service pages — **none of which Nowic Studio actually offers**:
- ❌ `/services/ui-ux-design` — Design is part of other services, not standalone
- ❌ `/services/mobile-app-development` — No mobile app development offered
- ❌ `/services/flutter-development` — No Flutter in tech stack
- ❌ `/services/android-development` — No Android development
- ❌ `/services/ios-development` — No iOS development
- ❌ `/services/cross-platform-app-development` — No cross-platform mobile
- ❌ `/services/custom-software-development` — This is too generic; covered by MVP/SaaS/API
- ❌ `/services/software-development` — Too generic; covered by existing services
- ❌ `/services/seo` — Not an SEO agency
- ❌ `/services/cloud-solutions` — Not a cloud solutions provider
- ❌ `/services/ecommerce-development` — No e-commerce projects in portfolio
- ❌ `/services/mvp-development` — Already exists as "MVP Development"
- ❌ `/services/website-development` — Already exists as "Business Websites"

---

## 5. MOBILE APP DEVELOPMENT — DO NOT CREATE

The original plan dedicates an entire phase (Phase 4) to mobile app development topic clusters. **Nowic Studio does not offer mobile app development.** The tech stack is entirely web-based (React, Next.js, Vite, Django, Node.js). Creating mobile app pages would be fabricating services.

**Action:** SKIP Phase 4 entirely. Do not create any mobile app development pages.

---

## 6. UI/UX TOPICAL AUTHORITY — MINIMAL APPROACH

The original plan proposes 8+ UI/UX sub-pages. Nowic Studio offers design as part of their development services, not as a standalone offering.

**Recommended approach:**
- Create a single `/services/ui-ux-design` page ONLY if design becomes a standalone service
- For now, integrate UI/UX content into existing service pages (MVP, SaaS, Business Websites)
- Add a "Design Process" section to each service page
- Create 1-2 blog posts about design process (e.g., "UI/UX Design Process for MVPs")

**Action:** SKIP the UI/UX topic cluster. Integrate design content into service pages and blog.

---

## 7. WEB DEVELOPMENT CLUSTER

The original plan proposes 10+ web development sub-pages. Nowic Studio's web development is covered by 3 existing services: Business Websites, SaaS Platforms, and API & Backend.

**Recommended approach:**
- Create individual pages for the 3 web-related services (already in Section 4)
- Add a "Web Development Process" section to each
- Create blog posts: "How to Choose Between a Business Website and a SaaS Platform", "Frontend vs Backend: What You Need to Know"
- Create technology pages for React, Next.js, Django, Node.js (Section 9)

**Action:** Focus on the 3 existing web services. No additional web development sub-pages needed.

---

## 8. CUSTOM SOFTWARE DEVELOPMENT

The original plan proposes a major "Custom Software Development" page. Nowic Studio's services already cover custom software development through MVP Development, SaaS Platforms, and API & Backend.

**Recommended approach:**
- Add a "Custom Software vs Off-the-Shelf" section to the Services overview page
- Create a blog post: "Custom Software vs SaaS: Which is Right for Your Business?"
- Link from Services → relevant case studies

**Action:** Integrate custom software content into existing pages. No separate page needed.

---

## 9. INDUSTRY PAGES

Only create industry pages for industries with **real projects** in the portfolio:

| Industry | Projects | Action |
|----------|----------|--------|
| Startups | Event Ticket Booking, Siya AI | ✅ CREATE `/industries/startups` |
| Healthcare | BloodConnect | ✅ CREATE `/industries/healthcare` |
| E-commerce | Catering Services Website | ✅ CREATE `/industries/ecommerce` |
| SaaS/B2B | Siya AI, Event Ticket Booking | ✅ CREATE `/industries/saas` |

**Do NOT create:** Education, Finance, Logistics, Real Estate (no projects in these industries)

Each industry page should include:
- Industry-specific challenges
- How Nowic Studio solves them
- Relevant case studies
- Technology recommendations
- FAQ

---

## 10. TECHNOLOGY HUB

Create technology pages **only for technologies actually used** (from `llms-full.txt`):

### Frontend Technologies:
- `/technologies/react` — Primary UI framework
- `/technologies/nextjs` — SSR, SEO-critical apps
- `/technologies/vite` — Fast build tooling
- `/technologies/typescript` — Type-safe development
- `/technologies/tailwind-css` — Utility-first styling
- `/technologies/framer-motion` — Animations

### Backend Technologies:
- `/technologies/django` — Full-stack web framework
- `/technologies/django-ninja` — High-performance API framework
- `/technologies/nodejs` — JavaScript backend runtime
- `/technologies/expressjs` — Lightweight API framework
- `/technologies/fastapi` — High-performance Python APIs

### Database Technologies:
- `/technologies/postgresql` — Primary relational database
- `/technologies/supabase` — Backend-as-a-Service
- `/technologies/redis` — Caching, sessions, job queues
- `/technologies/mongodb` — Document-oriented storage

### AI/ML Technologies:
- `/technologies/openai` — GPT-4/4o integration
- `/technologies/claude` — Anthropic Claude integration
- `/technologies/langchain` — LLM orchestration
- `/technologies/pinecone` — Vector database for RAG
- `/technologies/pgvector` — PostgreSQL vector extension

### DevOps Technologies:
- `/technologies/vercel` — Frontend deployment
- `/technologies/render` — Backend deployment
- `/technologies/docker` — Containerization
- `/technologies/github-actions` — CI/CD

### Authentication & Payments:
- `/technologies/clerk` — User authentication
- `/technologies/authjs` — OAuth/JWT auth
- `/technologies/stripe` — International payments
- `/technologies/razorpay` — Indian payments

Each technology page should include:
- What Nowic Studio uses it for
- Relevant services that use it
- Why it's suitable for the use case
- Related case studies
- Related technologies
- FAQ

---

## 11. SOLUTIONS / USE CASES

Create solution pages based on actual client problems:

| Solution | URL | Description |
|----------|-----|-------------|
| MVP for Startups | `/solutions/mvp-for-startups` | How we help startups validate ideas fast |
| AI Integration | `/solutions/ai-integration` | Adding AI capabilities to existing products |
| SaaS Platform | `/solutions/saas-platform` | Building scalable SaaS products |
| Business Website | `/solutions/business-website` | Premium marketing websites that convert |
| Admin Dashboard | `/solutions/admin-dashboard` | Internal tools and analytics dashboards |
| API Development | `/solutions/api-development` | Scalable backend APIs |

Each solution page should connect: **USER PROBLEM → SOLUTION → NOWIC STUDIO**

---

## 12. CASE STUDY STRUCTURE

### 12.1 Current State
- Case studies are expandable cards on `/case-studies` page
- No individual URLs
- Limited detail (problem, solution, results only)

### 12.2 Recommended Structure (for each case study)

**URL:** `/case-studies/:slug`

Each case study page must include:
1. **Hero** — Project title, category, tech stack tags
2. **Client & Industry** — Who the client is, what industry
3. **The Problem** — Specific challenge the client faced
4. **Requirements** — What was needed
5. **Our Approach** — UX/UI, development process
6. **Technology Stack** — Specific tools used
7. **Development Process** — Timeline, sprints, milestones
8. **Challenges & Solutions** — Specific obstacles and how they were overcome
9. **Final Solution** — What was delivered
10. **Screenshots** — Visual evidence of the product
11. **Features** — List of key features
12. **Results** — Metrics where genuinely available (no fabrication)
13. **Nowic Studio's Role** — What we specifically did
14. **Related Links** — Links to relevant service pages, technology pages
15. **CTA** — "Start Your Project"
16. **Schema.org** — Article + BreadcrumbList + CreativeWork JSON-LD

### 12.2 Case Studies to Create

Based on existing portfolio items:
1. **Event Ticket Booking System** → `/case-studies/event-ticket-booking`
   - Links to: SaaS Platforms, API & Backend, PostgreSQL, Stripe
2. **Siya AI — Assistant Platform** → `/case-studies/siya-ai`
   - Links to: AI Web Apps, OpenAI, LangChain, Admin Dashboards
3. **BloodConnect** → `/case-studies/bloodconnect`
   - Links to: MVP Development, Healthcare Industry, MongoDB, Maps API
4. **Catering Services Website** → `/case-studies/catering-website`
   - Links to: Business Websites, SEO, CMS, Framer Motion

---

## 13. BLOG / CONTENT STRATEGY

### 13.1 Current State
- Blog infrastructure exists (Blog.jsx, BlogPostDetail.jsx, BlogPost model)
- No posts published yet
- BlogPostDetail has BlogPosting schema and markdown rendering

### 13.2 Content Plan (First 8 Articles)

| # | Title | Target Keywords | Links To |
|---|-------|-----------------|----------|
| 1 | How Much Does MVP Development Cost in 2026? | mvp development cost, mvp cost india, how much does an mvp cost | /services/mvp-development, /pricing |
| 2 | How to Choose the Right Tech Stack for Your SaaS Product | saas tech stack, saas development, react vs nextjs | /services/saas-platforms, /technologies/react, /technologies/nextjs |
| 3 | AI Integration: Adding LLMs to Your Existing Product | ai integration, llm integration, openai api, claude api | /services/ai-web-apps, /technologies/openai, /technologies/langchain |
| 4 | Custom SaaS vs Off-the-Shelf: Which is Right for You? | custom saas vs off the shelf, saas development, build vs buy | /services/saas-platforms, /solutions/saas-platform |
| 5 | The Complete Guide to Admin Dashboard Development | admin dashboard development, react dashboard, django admin | /services/admin-dashboards, /technologies/react, /technologies/django |
| 6 | How to Build a Business Website That Converts in 2026 | business website, website development, conversion optimization | /services/business-websites, /pricing |
| 7 | API Development Best Practices: REST vs GraphQL | api development, rest vs graphql, backend development | /services/api-backend, /technologies/django-ninja, /technologies/nodejs |
| 8 | From Idea to Launch: The MVP Development Process | mvp development process, startup mvp, product development | /services/mvp-development, /case-studies/event-ticket-booking |

### 13.3 Content Quality Rules
- ✅ Original, written by the team
- ✅ Specific to Nowic Studio's actual experience
- ✅ No keyword stuffing
- ✅ No fabricated statistics
- ✅ Links naturally to relevant service/technology pages
- ✅ Each article answers: What? Who? Why? How? Process? Tech? FAQ?

---

## 14. KEYWORD / TOPIC CLUSTERS

### Cluster 1: MVP Development
- **Primary page:** `/services/mvp-development`
- **Supporting content:** Blog post #1, Blog post #8
- **Related:** `/solutions/mvp-for-startups`, `/case-studies/event-ticket-booking`
- **Keywords:** mvp development company, mvp development agency, build mvp fast, mvp development cost, mvp development process

### Cluster 2: SaaS Platform Development
- **Primary page:** `/services/saas-platforms`
- **Supporting content:** Blog post #2, Blog post #4
- **Related:** `/solutions/saas-platform`, `/case-studies/event-ticket-booking`
- **Keywords:** saas development company, saas platform development, build saas product, saas development cost

### Cluster 3: AI Web App Development
- **Primary page:** `/services/ai-web-apps`
- **Supporting content:** Blog post #3
- **Related:** `/solutions/ai-integration`, `/case-studies/siya-ai`
- **Keywords:** ai development company, ai app development, llm integration, ai web app development

### Cluster 4: Business Website Development
- **Primary page:** `/services/business-websites`
- **Supporting content:** Blog post #6
- **Related:** `/case-studies/catering-website`
- **Keywords:** business website development, website development company, business website cost

### Cluster 5: Admin Dashboard Development
- **Primary page:** `/services/admin-dashboards`
- **Supporting content:** Blog post #5
- **Related:** `/case-studies/siya-ai`
- **Keywords:** admin dashboard development, dashboard development, react dashboard

### Cluster 6: API & Backend Development
- **Primary page:** `/services/api-backend`
- **Supporting content:** Blog post #7
- **Related:** `/case-studies/event-ticket-booking`
- **Keywords:** api development company, backend development, rest api development, graphql development

---

## 15. INTERNAL LINKING STRATEGY

### 15.1 Homepage → Key Pages
- Home → Services (overview)
- Home → Each individual service page
- Home → Portfolio
- Home → Case Studies
- Home → Technologies
- Home → Blog
- Home → About
- Home → Contact

### 15.2 Service Pages → Related Content
- Each service page → Related case studies
- Each service page → Related technology pages
- Each service page → Related solution pages
- Each service page → Pricing
- Each service page → Contact/Booking

### 15.3 Case Studies → Contextual Links
- Each case study → Related service page(s)
- Each case study → Related technology page(s)
- Each case study → Related industry page
- Each case study → Portfolio grid

### 15.4 Blog Posts → Contextual Links
- Each blog post → Related service page(s)
- Each blog post → Related technology page(s)
- Each blog post → Related case study
- Each blog post → Pricing or Contact

### 15.5 Technology Pages → Contextual Links
- Each technology page → Related service pages
- Each technology page → Related case studies
- Each technology page → Related technologies

### 15.6 Navigation Consistency
- Every page has breadcrumb navigation
- Every page has a CTA to Contact or Booking
- Every page links to at least 3-5 other relevant pages

---

## 16. ENTITY SEO STRATEGY

### 16.1 Organization Entity
- **Name:** Nowic Studio
- **Alternate names:** Nowic, NowicStdio (as listed in llms-full.txt)
- **Founded:** 2026
- **Location:** India (serving clients worldwide)
- **Tagline:** Vision to Version
- **Description:** Premium software development agency building MVPs, SaaS platforms, AI-integrated web applications, and custom digital products for startups and growing businesses worldwide.
- **SameAs:** LinkedIn, GitHub, Twitter (from Footer component)
- **Logo:** https://nowicstdio.tech/image.png
- **Email:** haiderssaqulain@gmail.com

### 16.2 Service Entities
Each of the 6 services should have its own Service schema with:
- Name, description, URL
- Provider (Organization)
- Area served (Worldwide)
- Offers (pricing info where available)

### 16.3 Technology Entities
Each technology page should have:
- TechArticle or Article schema
- About Nowic Studio's use of the technology
- Related services and case studies

### 16.4 Content Entities
- Blog posts: BlogPosting schema (already implemented)
- Case studies: Article schema
- Portfolio items: CreativeWork schema
- Reviews: Review schema

---

## 17. SCHEMA STRATEGY

### 17.1 Current Schema (KEEP)
- Organization (Home, About, Services, Contact, Pricing)
- WebSite (Home)
- ProfessionalService (Home, Pricing)
- Service + OfferCatalog (Services, Home)
- BreadcrumbList (all pages)
- FAQPage (Home, Services, Pricing)
- Blog + BlogPosting (Blog, BlogPostDetail)
- CollectionPage (Portfolio, Case Studies)
- ContactPage (Contact)
- AboutPage (About)

### 17.2 Schema to ADD
- **Service** (individual service pages) — Service schema with detailed description, provider, areaServed
- **Article** (case study pages) — Article schema with headline, image, datePublished, author, publisher
- **CreativeWork** (portfolio project pages) — CreativeWork schema with name, description, image, author
- **TechArticle** (technology pages) — TechArticle schema with headline, description, author
- **Review** (testimonial/review pages) — Review schema with reviewRating, author
- **LocalBusiness** — Consider adding if location-based SEO is important (India-based)

### 17.3 Schema to IMPROVE
- Add `sameAs` to Organization schema (currently empty `[]` in Home.jsx)
- Add `founder` or `employee` Person schema to About page
- Add `review` array to Organization schema (aggregate rating)
- Add `hasOfferCatalog` to individual service pages

---

## 18. TECHNICAL SEO ISSUES

### 18.1 Critical (P0)

| Issue | Current State | Fix |
|-------|---------------|-----|
| Static sitemap.xml | Only 8 core pages, no blog posts | ✅ Generate static sitemap with all routes |
| No favicon | Not referenced in index.html | ✅ Add favicon.ico and PNG to public/, reference in index.html |
| No 404 page SEO | NotFound component exists but no SEO | ✅ Add SEO meta tags, helpful links, search box to 404 page |
| SPA routing | Client-side routing, no SSR | Add prerendering or SSR for key pages (Home, Services, Portfolio, About, Contact, Blog) |

### 18.2 High Priority (P1)

| Issue | Current State | Fix |
|-------|---------------|-----|
| No individual service pages | Single /services page | ✅ Create 6 individual service pages with full content |
| No case study detail pages | Expandable cards only | ✅ Merged into Portfolio (/portfolio/:slug) |
| No portfolio project pages | Grid only | ✅ Create individual portfolio project pages |
| No hreflang tags | Only geo.region meta | ✅ Add hreflang="en-IN" and hreflang="en" to all pages |
| No breadcrumb navigation | Not implemented | ✅ Add breadcrumb component to all pages |
| No internal linking | Minimal | ✅ Add contextual links between all related pages |
| No structured data for new pages | Only existing pages have schema | ✅ Add schema to all new pages |

### 18.3 Medium Priority (P2)

| Issue | Current State | Fix |
|-------|---------------|-----|
| No technology pages | None | ✅ Create 15-20 technology pages |
| No industry pages | None | ✅ Create 4 industry pages (startups, healthcare, e-commerce, SaaS) |
| No solution pages | None | ✅ Create 6 solution pages |
| No blog content | Infrastructure ready, no posts | ✅ Publish 8 blog articles |
| No FAQ page | FAQs scattered | ✅ Create consolidated /faqs page |
| Image optimization | Basic lazy loading | ✅ Add WebP/AVIF, proper sizing, alt text audit |
| No search functionality | None | ✅ Add blog/portfolio search |

### 18.4 Low Priority (P3)

| Issue | Current State | Fix |
|-------|---------------|-----|
| No hreflang for other languages | English only | Consider adding if expanding to other markets |
| No AMP pages | None | Optional, not critical for this type of site |
| No PWA features | None | Optional, could add service worker for offline |
| No structured data testing | Manual | Set up Google Rich Results Test automation |

---

## 19. ROBOTS.TXT ANALYSIS

### Current State (KEEP — already well-configured)
```
User-agent: *
Allow: /
Sitemap: https://nowicstdio.tech/sitemap.xml

Disallow: /admin
Disallow: /dashboard
Disallow: /review

# AI crawlers explicitly allowed
User-agent: GPTBot → Allow: /
User-agent: ChatGPT-User → Allow: /
User-agent: ClaudeBot → Allow: /
User-agent: PerplexityBot → Allow: /
User-agent: Google-Extended → Allow: /
User-agent: Bingbot → Allow: /
User-agent: FacebookBot → Allow: /

# Low-value scrapers
User-agent: CCBot → Disallow: /
User-agent: AhrefsBot → Crawl-delay: 10
User-agent: SemrushBot → Crawl-delay: 10
```

### Recommendations:
- ✅ KEEP as-is — already excellent for AI crawler compatibility
- ✅ ADD: `User-agent: Applebot` → Allow: / (for Siri/Apple Intelligence)
- ✅ ADD: `User-agent: Diffbot` → Allow: / (for knowledge graph extraction)
- ✅ ADD: `User-agent: Amazonbot` → Allow: / (for Alexa/Amazon Q)
- ✅ ADD: `User-agent: Bytespider` → Allow: / (TikTok's crawler)
- ✅ ADD: `User-agent: TrufflePig` → Allow: / (for AI training data)
- ✅ ADD: `User-agent: Cohere AI` → Allow: / (for AI search)

---

## 20. SITEMAP.XML ANALYSIS

### Current State (FIX — critical issue)
- **Static file** at `frontend/public/sitemap.xml`
- Only includes 8 core pages: `/`, `/services`, `/portfolio`, `/pricing`, `/contact`, `/booking`, `/about`, `/blog`, `/privacy-policy`, `/llms.txt`, `/llms-full.txt`
- **Does NOT include:** Blog posts, portfolio items, case studies, individual service pages
- **Backend has dynamic sitemap.py** that includes blog posts and services, but it's not being used (static file takes precedence on Vercel)

### Fix Options:
1. **Option A (Recommended):** Deploy the backend dynamic sitemap.py and remove the static file
2. **Option B:** Generate a static sitemap.xml that includes all current routes (including blog posts)
3. **Option C:** Use a build script to generate sitemap.xml from the API at build time

### Recommended sitemap structure:
```xml
<!-- Core pages (priority 1.0-0.8) -->
<url><loc>/</loc><priority>1.0</priority></url>
<url><loc>/services</loc><priority>0.9</priority></url>
<url><loc>/services/mvp-development</loc><priority>0.8</priority></url>
... (all 6 service pages)
<url><loc>/portfolio</loc><priority>0.8</priority></url>
<url><loc>/portfolio/:slug</loc><priority>0.7</priority></url>
... (all portfolio items)
<url><loc>/case-studies</loc><priority>0.8</priority></url>
<url><loc>/case-studies/:slug</loc><priority>0.7</priority></url>
... (all case studies)
<url><loc>/technologies</loc><priority>0.7</priority></url>
<url><loc>/technologies/:slug</loc><priority>0.6</priority></url>
... (all technology pages)
<url><loc>/industries</loc><priority>0.6</priority></url>
<url><loc>/industries/:slug</loc><priority>0.6</priority></url>
... (all industry pages)
<url><loc>/solutions</loc><priority>0.6</priority></url>
<url><loc>/solutions/:slug</loc><priority>0.6</priority></url>
... (all solution pages)
<url><loc>/blog</loc><priority>0.8</priority></url>
<url><loc>/blog/:slug</loc><priority>0.7</priority></url>
... (all blog posts)
<url><loc>/about</loc><priority>0.7</priority></url>
<url><loc>/contact</loc><priority>0.7</priority></url>
<url><loc>/pricing</loc><priority>0.7</priority></url>
<url><loc>/faqs</loc><priority>0.6</priority></url>
<url><loc>/privacy-policy</loc><priority>0.3</priority></url>
<url><loc>/llms.txt</loc><priority>0.3</priority></url>
<url><loc>/llms-full.txt</loc><priority>0.3</priority></url>
```

---

## 21. GOOGLE SEARCH CONSOLE RECOMMENDATIONS

### Current State
- GA4 tracking ID: `G-SP3K10LD72` (in Analytics.jsx)
- No evidence of Search Console verification in the codebase

### Recommendations:
1. **VERIFY** Google Search Console property for `https://nowicstdio.tech`
2. **SUBMIT** sitemap.xml (after fixing it to be dynamic)
3. **CHECK** current indexed pages (baseline report)
4. **CHECK** crawl errors and 404s
5. **CHECK** Core Web Vitals report
6. **CHECK** mobile usability report
7. **CHECK** structured data report (Rich Results Test)
8. **SET UP** performance monitoring for key pages

### Key Pages to Monitor:
- Homepage (`/`)
- Services (`/services`)
- Portfolio (`/portfolio`)
- About (`/about`)
- Contact (`/contact`)
- Blog (`/blog`)
- New service pages (after creation)
- New case study pages (after creation)

---

## 22. BING WEBMASTER RECOMMENDATIONS

### Current State
- No evidence of Bing Webmaster Tools in the codebase

### Recommendations:
1. **VERIFY** Bing Webmaster Tools property
2. **SUBMIT** sitemap.xml
3. **CHECK** indexing status
4. **CHECK** crawl errors
5. **CHECK** SEO reports
6. **MONITOR** search keyword performance

---

## 23. AI CRAWLER ACCESSIBILITY RECOMMENDATIONS

### Current State (GOOD — already well-configured)
- robots.txt explicitly allows GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Bingbot, FacebookBot
- llms.txt and llms-full.txt provide structured knowledge
- vercel.json allows all routes except admin/dashboard/review

### Recommendations:
1. ✅ KEEP existing AI crawler allowances
2. ✅ ADD more AI crawler user-agents to robots.txt (Applebot, Diffbot, Amazonbot, Bytespider, TrufflePig, Cohere AI)
3. ✅ ENSURE llms.txt and llms-full.txt are kept up-to-date with new services/pages
4. ✅ ADD structured FAQ content to service pages (AI systems extract Q&A)
5. ✅ ADD clear "What is this service?" sections to all service pages
6. ✅ ENSURE all pages have clear H1 → H2 → H3 heading hierarchy
7. ✅ ADD `data-*` attributes or structured content for AI extraction
8. ✅ CONSIDER adding `nopearner` AI content labels (transparent about AI-assisted content)

---

## 24. AI SEARCH / AEO / GEO RECOMMENDATIONS

### Current State (GOOD foundation)
- llms.txt and llms-full.txt already provide structured knowledge
- robots.txt allows AI crawlers
- FAQPage schema on multiple pages
- Clear service descriptions in schema

### Recommendations:

#### 24.1 Content Structure for AI Extraction
Every important page should clearly answer:
1. **What is the service?** — Clear H1 + first paragraph
2. **Who is it for?** — Target audience section
3. **What does Nowic Studio provide?** — Specific deliverables
4. **What technologies are used?** — Tech stack section
5. **What is the process?** — Step-by-step workflow
6. **What does the project involve?** — Scope and timeline
7. **What are the common questions?** — FAQ section
8. **What are the limitations?** — Honest constraints
9. **What are the alternatives?** — When to choose other options
10. **Why choose Nowic Studio?** — Differentiators
11. **What relevant work has been completed?** — Case studies/portfolio links

#### 24.2 AEO (Answer Engine Optimization)
- Add FAQ sections to every service page (5-8 questions each)
- Add "How-to" content in blog posts
- Use clear, direct question-answer format
- Include tables for comparisons (e.g., "MVP vs SaaS", "React vs Next.js")
- Add step-by-step process sections

#### 24.3 GEO (Generative Engine Optimization)
- Keep llms.txt updated with new pages/services
- Add llms-full.txt sections for new content
- Ensure all pages have clear, factual content
- Use structured data (schema.org) consistently
- Add "Key Takeaways" sections to blog posts
- Include "Related Services" sections on all pages

---

## 25. OFF-SITE ENTITY AUTHORITY STRATEGY

### Current State
- Footer has social links: Gmail, Twitter, Instagram, LinkedIn, GitHub
- llms-full.txt lists: Website, Email, Location
- No evidence of Clutch, GoodFirms, Crunchbase, Product Hunt profiles

### Recommendations:

#### 25.1 Company Profiles (CREATE)
| Platform | Priority | Action |
|----------|----------|--------|
| LinkedIn | P1 | Create/claim company page, add founder info |
| GitHub | P1 | Create organization, showcase projects |
| Clutch.co | P2 | Create profile, collect reviews |
| GoodFirms | P2 | Create profile |
| Crunchbase | P2 | Create company profile |
| Product Hunt | P3 | List products (Siya AI, etc.) |

#### 25.2 Brand Consistency
- **Company name:** Nowic Studio (always)
- **Tagline:** Vision to Version (always)
- **Website:** https://nowicstdio.tech (always)
- **Email:** haiderssaqulain@gmail.com (primary)
- **Location:** India (always)
- **Avoid:** "Nowic Studios", "Nowic Technology", "Nowic Tech" — these are NOT used

#### 25.3 Reviews & Testimonials
- Collect reviews from real clients
- Add to website with Review schema
- Submit to Clutch.co and GoodFirms
- Do NOT fabricate reviews

---

## 26. CONVERSION OPTIMIZATION

### Current State (GOOD foundation)
- Contact form with validation and GA4 tracking
- Booking page for calendar scheduling
- CTAs on every page ("Start a Project", "Book a Call")
- Pricing page with clear tiers
- Conversion events tracked: contact_submit, booking_submit, cta_click, form_start

### Recommendations:

#### 26.1 CTA Improvements
- Add "Discuss Your Project" CTAs to service pages
- Add "Request a Quote" CTAs to technology pages
- Add "Book a Free Consultation" CTAs to solution pages
- Add "View Case Study" CTAs to portfolio items

#### 26.2 Conversion Tracking
- ✅ Already tracking: contact_form_submit, booking_submit, cta_click, form_start, portfolio_link_click, pricing_plan_click
- ADD: service_page_visit (track which service pages are viewed)
- ADD: case_study_read (track case study engagement)
- ADD: blog_read (track blog engagement)
- ADD: technology_page_visit (track technology page views)

#### 26.3 Conversion Optimization
- Add exit-intent popup on service pages
- Add live chat (already has LiveChat component)
- Add testimonial carousel on service pages
- Add trust signals (projects delivered, satisfaction rate) on service pages
- Add "Related Services" section on each service page

---

## 27. ANALYTICS REQUIREMENTS

### Current State
- GA4 tracking ID: `G-SP3K10LD72`
- Tracks: page views, contact_form_submit, booking_submit, cta_click, form_start, portfolio_link_click, pricing_plan_click

### Recommendations:

#### 27.1 KPIs to Track
| Category | Metric | Target |
|----------|--------|--------|
| Traffic | Monthly organic sessions | 5,000+ (baseline) |
| Engagement | Average session duration | 2+ minutes |
| Engagement | Bounce rate | < 60% |
| Conversions | Contact form submissions | 50+/month |
| Conversions | Booking completions | 20+/month |
| Content | Blog post views | 500+/post |
| Content | Case study views | 200+/case study |
| SEO | Indexed pages | 50+ (after content creation) |
| SEO | Average position | Top 10 for key terms |

#### 27.2 Analytics Setup
- ✅ GA4 already configured
- ADD: Google Search Console (verify property)
- ADD: Bing Webmaster Tools (verify property)
- ADD: Microsoft Clarity (heatmaps, session recordings)
- ADD: Custom dimensions for service page tracking
- ADD: Event tracking for new page types (service pages, case studies, technology pages)

---

## 28. PRIORITY MATRIX

### P0 — Critical (Fix Immediately)
| Task | Description | Timeline |
|------|-------------|----------|
| Fix static sitemap.xml | Deploy dynamic sitemap or regenerate static with all routes | Week 1 |
| Add favicon | Add favicon to index.html | Week 1 |
| Fix 404 page | Add SEO meta tags and helpful links | Week 1 |
| Create individual service pages | 6 pages for actual services | Week 2-3 |
| Create case study detail pages | 4 pages for existing projects | Week 2-3 |

### P1 — High Priority (Month 1)
| Task | Description | Timeline |
|------|-------------|----------|
| Create portfolio project pages | Individual pages for 4 projects | Week 3 |
| Add breadcrumb navigation | Component for all pages | Week 2 |
| Add hreflang tags | en-IN, en | Week 2 |
| Improve internal linking | Contextual links between pages | Week 3 |
| Add structured data to new pages | Service, Article, CreativeWork schemas | Week 3 |
| Publish first 4 blog posts | MVP cost, SaaS tech stack, AI integration, custom vs off-the-shelf | Week 4 |
| Add FAQ page | Consolidated FAQs | Week 4 |

### P2 — Medium Priority (Month 2)
| Task | Description | Timeline |
|------|-------------|----------|
| Create technology pages | 15-20 pages for actual tech stack | Week 5-6 |
| Create industry pages | 4 pages (startups, healthcare, e-commerce, SaaS) | Week 6 |
| Create solution pages | 6 pages (MVP, AI, SaaS, etc.) | Week 6 |
| Publish 4 more blog posts | Dashboard guide, business website, API best practices, MVP process | Week 7 |
| Add image optimization | WebP/AVIF, proper alt text | Week 7 |
| Add search functionality | Blog/portfolio search | Week 8 |
| Add structured data improvements | sameAs, founder, review schema | Week 8 |

### P3 — Low Priority (Month 3+)
| Task | Description | Timeline |
|------|-------------|----------|
| Create company profiles | LinkedIn, GitHub, Clutch, GoodFirms | Month 3 |
| Collect client reviews | Submit to Clutch, GoodFirms | Month 3 |
| Add PWA features | Service worker, offline support | Month 3 |
| Add structured data testing | Rich Results Test automation | Month 3 |
| Expand blog content | Ongoing, 2-3 posts/month | Ongoing |
| Digital PR | Press releases, guest posts | Month 3+ |

---

## 29. 30-DAY PLAN (Weeks 1-4)

### Week 1: Foundation Fixes
- [ ] Fix static sitemap.xml → deploy dynamic or regenerate with all routes
- [ ] Add favicon to `index.html` and `public/`
- [ ] Improve 404 page with SEO meta tags and helpful links
- [ ] Add breadcrumb component to all existing pages
- [ ] Add hreflang tags to all pages
- [ ] Update robots.txt with additional AI crawler allowances
- [ ] Audit and fix all existing image alt text

### Week 2: Service Pages
- [ ] Create `/services/mvp-development` page
- [ ] Create `/services/business-websites` page
- [ ] Create `/services/ai-web-apps` page
- [ ] Add Service schema + BreadcrumbList + FAQPage to each
- [ ] Add internal links from each service page to related content
- [ ] Update `/services` overview page to link to individual pages

### Week 3: Case Studies & Portfolio
- [ ] Create `/case-studies/:slug` pages for 4 existing projects
- [ ] Create `/portfolio/:slug` pages for 4 existing projects
- [ ] Add Article/CreativeWork schema to each
- [ ] Add internal links from case studies to service/technology pages
- [ ] Add internal links from portfolio to case studies

### Week 4: Content & Blog
- [ ] Publish blog post: "How Much Does MVP Development Cost in 2026?"
- [ ] Publish blog post: "How to Choose the Right Tech Stack for Your SaaS Product"
- [ ] Publish blog post: "AI Integration: Adding LLMs to Your Existing Product"
- [ ] Publish blog post: "Custom SaaS vs Off-the-Shelf: Which is Right for You?"
- [ ] Create `/faqs` consolidated FAQ page
- [ ] Update llms.txt and llms-full.txt with new pages
- [ ] Submit updated sitemap to Google Search Console

---

## 30. 60-DAY PLAN (Weeks 5-8)

### Week 5: Technology Pages
- [ ] Create `/technologies/react` page
- [ ] Create `/technologies/nextjs` page
- [ ] Create `/technologies/django` page
- [ ] Create `/technologies/nodejs` page
- [ ] Create `/technologies/postgresql` page
- [ ] Create `/technologies/supabase` page
- [ ] Add TechArticle schema to each

### Week 6: Industry & Solution Pages
- [ ] Create `/industries/startups` page
- [ ] Create `/industries/healthcare` page
- [ ] Create `/industries/ecommerce` page
- [ ] Create `/industries/saas` page
- [ ] Create `/solutions/mvp-for-startups` page
- [ ] Create `/solutions/ai-integration` page
- [ ] Create `/solutions/saas-platform` page
- [ ] Add internal links between industry/solution/service pages

### Week 7: More Content
- [ ] Publish blog post: "The Complete Guide to Admin Dashboard Development"
- [ ] Publish blog post: "How to Build a Business Website That Converts"
- [ ] Publish blog post: "API Development Best Practices: REST vs GraphQL"
- [ ] Publish blog post: "From Idea to Launch: The MVP Development Process"
- [ ] Add image optimization (WebP/AVIF, lazy loading)
- [ ] Add structured data improvements (sameAs, founder, review schema)

### Week 8: Optimization & Testing
- [ ] Add search functionality to blog and portfolio
- [ ] Audit all internal links for orphan pages
- [ ] Test all pages with Google Rich Results Test
- [ ] Test all pages with Lighthouse (Core Web Vitals)
- [ ] Verify all pages are accessible to AI crawlers
- [ ] Update llms-full.txt with all new content
- [ ] Submit updated sitemap to Bing Webmaster Tools

---

## 31. 90-DAY PLAN (Weeks 9-12)

### Week 9: Off-Site Authority
- [ ] Create/claim LinkedIn company page
- [ ] Create/claim GitHub organization
- [ ] Create Clutch.co profile
- [ ] Create GoodFirms profile
- [ ] Create Crunchbase profile
- [ ] Ensure brand consistency across all profiles

### Week 10: Reviews & Social Proof
- [ ] Collect reviews from existing clients
- [ ] Add Review schema to testimonials
- [ ] Submit reviews to Clutch.co and GoodFirms
- [ ] Add testimonial carousel to service pages
- [ ] Add trust signals to all pages

### Week 11: Advanced AEO/GEO
- [ ] Add "Key Takeaways" sections to blog posts
- [ ] Add comparison tables to relevant pages
- [ ] Add "Related Services" sections to all pages
- [ ] Add "People Also Ask" sections to service pages
- [ ] Update llms.txt with structured FAQ data
- [ ] Add structured data for FAQ on all service pages

### Week 12: Analytics & Reporting
- [ ] Set up Google Search Console (verify, submit sitemap)
- [ ] Set up Bing Webmaster Tools (verify, submit sitemap)
- [ ] Set up Microsoft Clarity (heatmaps, session recordings)
- [ ] Create custom GA4 dashboards for KPIs
- [ ] Set up conversion tracking for new page types
- [ ] Create baseline SEO report (indexed pages, crawl errors, Core Web Vitals)
- [ ] Plan ongoing content strategy (2-3 blog posts/month)

---

## 32. IMPLEMENTATION CHECKLIST

### Phase 1: Audit (COMPLETED)
- [x] Audit all existing pages
- [x] Audit navigation, footer, metadata
- [x] Audit structured data
- [x] Audit robots.txt, sitemap.xml
- [x] Audit technical SEO
- [x] Audit AI crawler compatibility
- [x] Identify existing good work to preserve

### Phase 2: Architecture (COMPLETED)
- [x] Define corrected URL structure
- [x] Define service architecture (6 actual services)
- [x] Define technology architecture (15-20 actual technologies)
- [x] Define industry architecture (4 industries with real projects)
- [x] Define solution architecture (6 solutions)
- [x] Define case study structure
- [x] Define blog/content strategy

### Phase 3: Implementation (TODO)
- [ ] Fix sitemap.xml (P0)
- [ ] Add favicon (P0)
- [ ] Fix 404 page (P0)
- [ ] Create 6 service pages (P1)
- [ ] Create 4 case study pages (P1)
- [ ] Create 4 portfolio project pages (P1)
- [ ] Add breadcrumbs (P1)
- [ ] Add hreflang (P1)
- [ ] Improve internal linking (P1)
- [ ] Add structured data to new pages (P1)
- [ ] Publish 8 blog posts (P1-P2)
- [ ] Create 15-20 technology pages (P2)
- [ ] Create 4 industry pages (P2)
- [ ] Create 6 solution pages (P2)
- [ ] Create FAQ page (P1)
- [ ] Add image optimization (P2)
- [ ] Add search functionality (P2)
- [ ] Create off-site profiles (P3)
- [ ] Collect reviews (P3)
- [ ] Set up analytics (P3)

---

## 33. WHAT TO KEEP, IMPROVE, CREATE, REMOVE

| Category | Item | Action | Reason |
|----------|------|--------|--------|
| **KEEP** | SEO component (SEO.jsx) | KEEP | Comprehensive, well-structured |
| **KEEP** | robots.txt AI crawler rules | KEEP | Already allows GPTBot, ClaudeBot, PerplexityBot |
| **KEEP** | llms.txt + llms-full.txt | KEEP | Accurate, comprehensive |
| **KEEP** | vercel.json security headers | KEEP | HSTS, X-Frame-Options, CSP |
| **KEEP** | GA4 analytics with conversion tracking | KEEP | Tracks contact submits, CTA clicks |
| **KEEP** | Schema.org on existing pages | KEEP | Organization, Service, FAQPage, BlogPosting |
| **KEEP** | Admin CMS | KEEP | Full content management |
| **KEEP** | 6 actual services | KEEP | Matches real offerings |
| **KEEP** | Tech stack references | KEEP | Accurate in llms-full.txt |
| **KEEP** | Pricing structure | KEEP | Matches actual pricing |
| **KEEP** | Contact form with validation | KEEP | Working with GA4 tracking |
| **IMPROVE** | Static sitemap.xml | IMPROVE | Deploy dynamic or regenerate with all routes |
| **IMPROVE** | No favicon | IMPROVE | Add to index.html |
| **IMPROVE** | 404 page | IMPROVE | Add SEO meta tags and helpful links |
| **IMPROVE** | No breadcrumbs | IMPROVE | Add breadcrumb component |
| **IMPROVE** | No hreflang | IMPROVE | Add hreflang="en-IN" and hreflang="en" |
| **IMPROVE** | Minimal internal linking | IMPROVE | Add contextual links between pages |
| **IMPROVE** | No individual service pages | IMPROVE | Create 6 pages |
| **IMPROVE** | No case study detail pages | IMPROVE | Create 4 pages |
| **IMPROVE** | No portfolio project pages | IMPROVE | Create 4 pages |
| **IMPROVE** | No blog content | IMPROVE | Publish 8 articles |
| **IMPROVE** | Organization sameAs empty | IMPROVE | Add LinkedIn, GitHub, Twitter URLs |
| **CREATE** | Technology pages | CREATE | 15-20 pages for actual tech stack |
| **CREATE** | Industry pages | CREATE | 4 pages (startups, healthcare, e-commerce, SaaS) |
| **CREATE** | Solution pages | CREATE | 6 pages (MVP, AI, SaaS, etc.) |
| **CREATE** | FAQ page | CREATE | Consolidated FAQs |
| **CREATE** | Off-site profiles | CREATE | LinkedIn, GitHub, Clutch, GoodFirms |
| **REMOVE** | Nothing | REMOVE | No existing content should be removed |
| **OPTIONAL** | Search functionality | OPTIONAL | Blog/portfolio search |
| **OPTIONAL** | PWA features | OPTIONAL | Service worker, offline support |
| **OPTIONAL** | AMP pages | OPTIONAL | Not critical for this site |

---

## 34. FINAL NOTE

This plan is **grounded in the actual codebase**. Every recommendation is based on:
1. What the website actually has (audited from source code)
2. What services the company actually offers (from content.js, llms-full.txt, models.py)
3. What technologies the company actually uses (from llms-full.txt, content.js)
4. What projects the company has actually built (from portfolioItems in content.js)

**No fake claims. No fabricated services. No thin pages. No keyword stuffing.**

The goal is to make Nowic Studio clearly understood as a **web development agency specializing in MVPs, SaaS platforms, AI web apps, business websites, admin dashboards, and API/backend development** — using React, Next.js, Django, Node.js, PostgreSQL, and AI technologies (OpenAI, Claude, LangChain).
