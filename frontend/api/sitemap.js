import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const BACKEND_SITEMAP = process.env.BACKEND_SITEMAP_URL || '';

export default async function handler(req, res) {
  // Try backend fetch when an explicit backend URL is provided.
  if (BACKEND_SITEMAP) {
    try {
      const r = await fetch(BACKEND_SITEMAP, { timeout: 5000 });
      const text = await r.text();
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      return res.status(r.status).send(text);
    } catch (err) {
      // fallback to static file below
      console.error('Failed fetching BACKEND_SITEMAP_URL:', err && err.message);
    }
  }

  // Fallback: serve the bundled static sitemap.xml from the frontend public folder.
  try {
    const __filename = fileURLToPath(import.meta.url);
    const projectRoot = path.resolve(path.dirname(__filename), '..');
    const staticPath = path.join(projectRoot, 'public', 'sitemap.xml');
    const xml = await fs.readFile(staticPath, 'utf8');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('Failed reading static sitemap:', err && err.message);
    return res.status(502).send('<?xml version="1.0" encoding="UTF-8"?><urlset></urlset>');
  }
}
