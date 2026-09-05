Search Console & Bing steps

- Verify the property for `https://nowicstdio.tech` in Google Search Console.
- After verification, submit the sitemap URL: `https://nowicstdio.tech/sitemap.xml`.
- For Bing Webmaster Tools, add the site and submit the same sitemap URL.
- Allow 24–48 hours for initial indexing updates and check the Coverage / Crawl Errors reports.

Quick verification tips

- Use the "URL Inspection" tool in Search Console to request indexing for important pages after deployment.
- Check the sitemap status in Search Console and Bing Webmaster Tools to ensure the submitted sitemap is parsed successfully.

CI Automation (optional)

If you prefer build-time generation, add a GitHub Action that runs on `push` to `main`:

- Steps: checkout, set up Python, install minimal deps (if needed), run `python Backend/manage.py generate_sitemap`, commit `frontend/public/sitemap.xml` back to the repository, and push.
- This keeps the static artifact up to date when using build-time generation and avoids requiring Python in Vercel build environments.

If you'd like, I can scaffold the GitHub Action for you and run it locally to test sitemap generation and commit flow.