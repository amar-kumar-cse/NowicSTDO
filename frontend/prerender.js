import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

// Base static routes
let routesToPrerender = [
  '/', 
  '/about', 
  '/contact', 
  '/services', 
  '/portfolio', 
  '/pricing', 
  '/technologies', 
  '/faqs', 
  '/privacy-policy',
  '/blog'
];

async function prerender() {
  console.log('[Prerender] Starting custom SSG process...');

  // 1. Extract routes from sitemap
  try {
    const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
      const matches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
      if (matches) {
        const dynamicRoutes = matches.map(m => {
          const urlStr = m.replace('<loc>', '').replace('</loc>', '');
          const urlObj = new URL(urlStr);
          let pathname = urlObj.pathname;
          if (pathname !== '/' && pathname.endsWith('/')) {
            pathname = pathname.slice(0, -1);
          }
          return pathname;
        });
        
        // Include blog post routes (limit to 5 locally to avoid huge build times if needed, or all in Vercel)
        // Since we are running manually, we can prerender all if not too many
        routesToPrerender = [...new Set([...routesToPrerender, ...dynamicRoutes])];
      }
    }
  } catch (err) {
    console.warn('[Prerender] Warning: Could not parse sitemap for prerender routes:', err.message);
  }

  // 2. Start Express server to serve dist/
  const app = express();
  const distPath = path.join(__dirname, 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('[Prerender] Error: dist/ folder not found. Run vite build first.');
    process.exit(1);
  }

  app.use(express.static(distPath));
  
  // Fallback for SPA routing
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  const PORT = process.env.PORT || 5173;
  const server = app.listen(PORT, async () => {
    const port = server.address().port;
    console.log(`[Prerender] Local server running on port ${port}`);
    
    // 3. Launch Puppeteer
    let browser;
    try {
      let puppeteerLaunchOptions = {
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      };

      if (isVercel) {
        try {
          const chromium = (await import('@sparticuz/chromium')).default;
          puppeteerLaunchOptions = {
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
          };
          console.log('[Prerender] Using @sparticuz/chromium for Vercel');
        } catch (e) {
          console.warn("[Prerender] Could not load @sparticuz/chromium on Vercel. Using default puppeteer.");
        }
      }

      console.log('[Prerender] Launching browser...');
      browser = await puppeteer.launch(puppeteerLaunchOptions);
      
      // Limit concurrency to 5
      const CONCURRENCY = 5;
      for (let i = 0; i < routesToPrerender.length; i += CONCURRENCY) {
        const batch = routesToPrerender.slice(i, i + CONCURRENCY);
        
        await Promise.all(batch.map(async (route) => {
          const page = await browser.newPage();
          
          try {
            // Setup trigger
            const triggerPromise = page.evaluateOnNewDocument(() => {
              window.prerenderTriggerFired = false;
              document.addEventListener('prerender-trigger', () => {
                window.prerenderTriggerFired = true;
              });
            });

            console.log(`[Prerender] Generating: ${route}`);
            
            // Navigate
            await page.goto(`http://localhost:${port}${route}`, { 
              waitUntil: 'domcontentloaded',
              timeout: 30000 
            });

            // Wait for the custom event to fire or the DOM to be ready, avoiding the 15s timeout
            await page.waitForFunction(() => {
                if (window.prerenderTriggerFired) return true;
                const root = document.getElementById('root');
                const hasPreloader = document.querySelector('.z-\\[9999\\]');
                return root && root.innerHTML.length > 50 && !hasPreloader;
            }, { timeout: 15000 }).catch(() => {
                console.warn(`[Prerender] Warning: prerender-trigger timeout on ${route}. Capturing anyway.`);
            });

            // Get HTML
            const html = await page.content();
            
            // Save HTML
            let htmlPath;
            if (route === '/') {
              htmlPath = path.join(distPath, 'index.html');
            } else {
              // Create flat .html file for Vercel cleanUrls support
              htmlPath = path.join(distPath, `${route}.html`);
              const routeDir = path.dirname(htmlPath);
              if (!fs.existsSync(routeDir)) {
                fs.mkdirSync(routeDir, { recursive: true });
              }
            }
            
            fs.writeFileSync(htmlPath, html.trim());
            console.log(`[Prerender] Saved: ${route}`);

          } catch (e) {
            console.error(`[Prerender] Error on ${route}:`, e.message);
          } finally {
            await page.close();
          }
        }));
      }
      
      console.log('[Prerender] All routes completed successfully!');
    } catch (e) {
      console.error('[Prerender] Fatal Error:', e);
    } finally {
      if (browser) await browser.close();
      server.close();
      process.exit(0);
    }
  });
}

prerender();
