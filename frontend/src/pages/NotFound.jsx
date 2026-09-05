import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useState } from 'react';

function NotFoundShell({ title, description, ctaLabel, ctaTo }) {
  return (
    <>
      <SEO 
        title={title}
        description={description}
        noIndex={true}
      />
      <div className="container-shell flex min-h-[70vh] flex-col items-center justify-center text-center py-20">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-text sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-xl text-sub">{description}</p>
        <div className="mt-8 w-full max-w-md">
          <form onSubmit={(e) => { e.preventDefault(); const q = e.target.search?.value || ''; if (!q) return; window.location.href = `https://www.google.com/search?q=site:www.nowicstdio.tech+${encodeURIComponent(q)}`; }} className="flex items-center gap-2">
            <input name="search" placeholder="Search the site (e.g. 'MVP cost')" className="flex-1 rounded-lg border border-white/10 bg-bg/60 px-4 py-3 text-sm text-text" />
            <button type="submit" className="cta-btn">Search</button>
          </form>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link to={ctaTo} className="cta-btn inline-flex">
              {ctaLabel}
            </Link>
            <Link to="/services" className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-transparent px-8 text-sm font-bold text-text transition-colors hover:bg-white/5">
              View Services
            </Link>
            <Link to="/portfolio" className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-transparent px-8 text-sm font-bold text-text transition-colors hover:bg-white/5">
              View Portfolio
            </Link>
            <Link to="/blog" className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-transparent px-8 text-sm font-bold text-text transition-colors hover:bg-white/5">
              Blog
            </Link>
            <Link to="/contact" className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-transparent px-8 text-sm font-bold text-text transition-colors hover:bg-white/5">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function NotFound() {
  return (
    <NotFoundShell
      title="Page not found"
      description="The page you are looking for does not exist or has moved."
      ctaLabel="Back to Home"
      ctaTo="/"
    />
  );
}

export function AdminNotFound() {
  return (
    <NotFoundShell
      title="Admin page not found"
      description="That admin route does not exist. Use the dashboard to continue."
      ctaLabel="Go to Admin Dashboard"
      ctaTo="/admin"
    />
  );
}