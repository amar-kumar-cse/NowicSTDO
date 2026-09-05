Sitemap deployment options for Nowic Studio frontend

Overview

This project supports two ways to deliver an up-to-date sitemap.xml to crawlers:

1) Runtime proxy (recommended when backend is available)
   - Vercel rewrites `/sitemap.xml` -> `/api/sitemap` (see `vercel.json`).
   - The serverless API `/api/sitemap` will fetch the backend sitemap when the env var `BACKEND_SITEMAP_URL` is set.
   - Set `BACKEND_SITEMAP_URL=https://<your-backend-host>/sitemap.xml` in Vercel environment variables.
   - Benefits: always fresh sitemap, no need to run Python at frontend build time.

2) Build-time static generation (fallback)
   - A `prebuild` script in `package.json` runs `python ../Backend/manage.py generate_sitemap` which writes `frontend/public/sitemap.xml`.
   - This requires Python and project dependencies available in the build environment.
   - Use this when the backend is not publicly reachable from Vercel or you prefer a static artifact.

Behavior implemented in this repo

- `frontend/api/sitemap.js` will:
  - Try to fetch `BACKEND_SITEMAP_URL` if set, and return its XML.
  - If fetch fails or `BACKEND_SITEMAP_URL` is not set, it serves the bundled `public/sitemap.xml`.

- `vercel.json` contains a rewrite that maps `/sitemap.xml` to `/api/sitemap` so crawlers receive the proxied or static sitemap.

Recommended setup

- Preferred: Enable runtime proxy in production by setting the Vercel env var:
  - `BACKEND_SITEMAP_URL=https://your-backend.example.com/sitemap.xml`
  - Keep the static `frontend/public/sitemap.xml` as a fallback during deployments.

- If your CI/build environment can run Python/Django reliably, keep `prebuild` in `package.json` to regenerate the static sitemap at build time.

Commands

- Generate sitemap locally (writes to `frontend/public/sitemap.xml`):

```bash
cd Backend
python manage.py generate_sitemap
```

- Start frontend dev server (static sitemap used during dev):

```bash
cd frontend
npm install
npm run dev
```

Notes & Troubleshooting

- Avoid setting `BACKEND_SITEMAP_URL` to a URL that rewrites back to the frontend (e.g., pointing at the same Vercel host) — this can cause proxy loops. Use the backend's canonical host (Render or direct hostname).
- If crawlers still see the old sitemap after deployment, check Vercel caching headers and the `Cache-Control` configuration in `vercel.json`.

Files to review

- `vercel.json` — rewrite and cache headers
- `frontend/api/sitemap.js` — runtime proxy and fallback logic
- `frontend/package.json` — `prebuild` script for static generation

If you want, I can also add a small CI step or GitHub Action to run `python Backend/manage.py generate_sitemap` and commit the generated `frontend/public/sitemap.xml` automatically during main branch updates.

Search Console & Bing steps

- Verify the property for `https://nowicstdio.tech` in Google Search Console.
- After verification, submit the sitemap URL: `https://nowicstdio.tech/sitemap.xml`.
- For Bing Webmaster Tools, add the site and submit the same sitemap URL.
- Allow 24–48 hours for initial indexing updates and check the Coverage / Crawl Errors reports.

Quick verification tips

- Use the "URL Inspection" tool in Search Console to request indexing for important pages after deployment.
- Check the sitemap status in Search Console and Bing Webmaster Tools to ensure the submitted sitemap is parsed successfully.

CI Automation (optional)

- If you prefer build-time generation, add a GitHub Action that runs on `push` to `main` and executes the sitemap generation management command.
- Minimal Action steps: checkout, set up Python, install `Backend/requirements.txt` (if present), run `python Backend/manage.py generate_sitemap`, then commit `frontend/public/sitemap.xml` back to the repo.
- This keeps the static artifact up to date when using build-time generation and avoids requiring Python in Vercel build environments.

If you'd like, I can scaffold the GitHub Action (already added at `.github/workflows/generate_sitemap.yml`) and tune it to your preferred branch, Python version, or install steps.
