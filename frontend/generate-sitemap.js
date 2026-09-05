import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemap() {
  try {
    console.log('[Sitemap] Generating sitemap...');
    // Base routes
    const routes = [
      '/', '/about', '/contact', '/services', '/portfolio', 
      '/pricing', '/technologies', '/faqs', '/privacy-policy', '/blog'
    ];
    
    // Fetch blog posts
    try {
      console.log('[Sitemap] Fetching blog posts...');
      const baseUrl = (process.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/api/v1/public/blog/`);
      const data = await response.json();
      
      if (data.success && data.data) {
        data.data.forEach(post => {
          routes.push(`/blog/${post.slug}`);
        });
        console.log(`[Sitemap] Fetched ${data.data.length} blog posts.`);
      }
    } catch (apiError) {
      console.warn('[Sitemap] Warning: Could not fetch blog posts for sitemap. Using only static routes.', apiError.message);
    }

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>\n    <loc>https://www.nowicstdio.tech${route}</loc>\n    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>\n    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n  </url>`).join('\n')}
</urlset>`;

    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
    console.log('[Sitemap] Successfully generated public/sitemap.xml');
  } catch (error) {
    console.error('[Sitemap] Error generating sitemap:', error);
    process.exit(1); // Exit with error if it completely fails
  }
}

generateSitemap();
