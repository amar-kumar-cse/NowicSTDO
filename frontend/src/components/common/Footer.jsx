
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useContent } from '../../context/ContentContext';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

/* ── SVG Social Icons (inline for tooltip animation) ── */
function GmailIcon() {
  return (
    <svg viewBox="0 0 24 24" height="1.15em" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 18h-2V9.25L12 13 6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20m0-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg height="1.15em" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path d="M42,12.429c-1.323,0.586-2.746,0.977-4.247,1.162c1.526-0.906,2.7-2.351,3.251-4.058c-1.428,0.837-3.01,1.452-4.693,1.776C34.967,9.884,33.05,9,30.926,9c-4.08,0-7.387,3.278-7.387,7.32c0,0.572,0.067,1.129,0.193,1.67c-6.138-0.308-11.582-3.226-15.224-7.654c-0.64,1.082-1,2.349-1,3.686c0,2.541,1.301,4.778,3.285,6.096c-1.211-0.037-2.351-0.374-3.349-0.914c0,0.022,0,0.055,0,0.086c0,3.551,2.547,6.508,5.923,7.181c-0.617,0.169-1.269,0.263-1.941,0.263c-0.477,0-0.942-0.054-1.392-0.135c0.94,2.902,3.667,5.023,6.898,5.086c-2.528,1.96-5.712,3.134-9.174,3.134c-0.598,0-1.183-0.034-1.761-0.104C9.268,36.786,13.152,38,17.321,38c13.585,0,21.017-11.156,21.017-20.834c0-0.317-0.01-0.633-0.025-0.945C39.763,15.197,41.013,13.905,42,12.429" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="1.15em" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="1.15em" fill="currentColor" viewBox="0 0 448 512">
      <path d="M100.28 448H7.4V149h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V149h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.83-48.3 93.97 0 111.29 61.9 111.29 142.3V448z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="1.15em" fill="currentColor" viewBox="0 0 496 512">
      <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z" />
    </svg>
  );
}

function SocialLink({ href, label, className, children }) {
  const baseClassName = `inline-flex h-full w-full items-center justify-center rounded-full bg-transparent p-0 text-inherit border-0 ${className || ''}`.trim();

  if (href) {
    return (
      <a href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className={baseClassName}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" aria-label={label} aria-disabled="true" disabled className={`${baseClassName} opacity-45 pointer-events-none`.trim()}>
      {children}
    </button>
  );
}

export default function Footer() {
  const { content = {} } = useContent();
  const brand = content.brand || {};
  const brandName = brand.name || 'Nowic Studio';
  const tagline = brand.tagline || 'Vision to Version';
  const email = brand.email || 'hello@nowicstudio.com';
  const phone = brand.phone || '+91 98765 43210';
  const location = brand.location || 'India 🇮🇳';

  return (
    <footer className="mt-20 border-t border-subtle bg-panel">
      <div className="container-shell py-12">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3">
              <BrandLogo variant="full" className="h-10 w-10 rounded-lg overflow-hidden" />
              <div>
                <p className="font-display text-sm font-bold text-text">{brandName}</p>
                <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted">{tagline}</p>
              </div>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-sub">
              Premium software agency delivering MVPs, AI apps, and digital products that scale.
            </p>

            {/* ── Animated Social Icons ── */}
            <ul className="social-icons mt-5">
              <li className="s-icon gmail">
                <span className="s-tooltip">Gmail</span>
                <a href={`mailto:${email}`} aria-label="Gmail">
                  <GmailIcon />
                </a>
              </li>
              <li className="s-icon twitter">
                <span className="s-tooltip">Twitter</span>
                <SocialLink href={brand.twitter} label="Twitter" className="social-icon-link">
                  <TwitterIcon />
                </SocialLink>
              </li>
              <li className="s-icon instagram">
                <span className="s-tooltip">Instagram</span>
                <SocialLink href={brand.instagram} label="Instagram" className="social-icon-link">
                  <InstagramIcon />
                </SocialLink>
              </li>
              <li className="s-icon linkedin">
                <span className="s-tooltip">LinkedIn</span>
                <SocialLink href={brand.linkedin} label="LinkedIn" className="social-icon-link">
                  <LinkedInIcon />
                </SocialLink>
              </li>
              <li className="s-icon github">
                <span className="s-tooltip">GitHub</span>
                <SocialLink href={brand.github} label="GitHub" className="social-icon-link">
                  <GithubIcon />
                </SocialLink>
              </li>
            </ul>
          </div>

          {/* Nav */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted">Navigation</p>
            <ul className="space-y-2">
              {navLinks.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-sub transition-colors hover:text-text">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted">Services</p>
            <ul className="space-y-2">
              {['MVP Development', 'Business Websites', 'AI Web Apps', 'Dashboards', 'SaaS Platforms'].map((s) => (
                <li key={s}>
                  <Link to="/services" className="text-sm text-sub transition-colors hover:text-text">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted">Contact</p>
            <ul className="space-y-2">
              <li><a href={`mailto:${email}`} className="text-sm text-sub hover:text-text">{email}</a></li>
              <li><a href={`tel:${phone}`} className="text-sm text-sub hover:text-text">{phone}</a></li>
              <li className="text-sm text-sub">{location}</li>
            </ul>
            <Link to="/contact" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-mint hover:text-glow">
              Start a Project <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-subtle pt-6 text-xs text-muted">
          <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <p>Built with <span className="text-mint">♥</span> in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
