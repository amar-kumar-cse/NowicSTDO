import { useEffect as usePrerenderEffect } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Search } from 'lucide-react';
import SEO from '../components/SEO';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { BASE_URL } from '../lib/api';
import { useContent } from '../context/ContentContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { CaseStudyCard } from '../components/ui/CaseStudyCard';

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

function formatCategory(value) {
  if (!value) return 'Uncategorized';
  return value
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { content, loading } = useContent();

  usePrerenderEffect(() => {
    if (!loading) {
      setTimeout(() => document.dispatchEvent(new Event('prerender-trigger')), 150);
    }
  }, [loading]);

  const allProjects = content?.portfolioItems || content?.portfolio || [];
  const error = null;

  const projects = Array.isArray(allProjects) ? [...allProjects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];
  const categories = ['all', ...new Set(projects.map((p) => p.category).filter(Boolean))];
  
  const filtered = projects.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;
    const titleMatch = (p.title || '').toLowerCase().includes(q);
    const descMatch = (p.description || '').toLowerCase().includes(q);
    const techMatch = Array.isArray(p.tech_stack) && p.tech_stack.some(t => t.toLowerCase().includes(q));
    return matchesCat && (titleMatch || descMatch || techMatch);
  });

  const portfolioSchema = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Portfolio - Nowic Studio",
      "url": "https://www.nowicstdio.tech/portfolio",
      "description": "View our portfolio of MVPs, SaaS platforms, AI web apps, and custom digital products built with precision.",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": projects.map((p, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "item": {
            "@type": "CreativeWork",
            "name": p.title,
            "description": p.description,
            "image": resolveImageUrl(p.image_url) || "https://www.nowicstdio.tech/image.png",
            "author": {
              "@type": "Organization",
              "name": "Nowic Studio"
            }
          }
        }))
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.nowicstdio.tech/" },
        { "@type": "ListItem", "position": 2, "name": "Portfolio", "item": "https://www.nowicstdio.tech/portfolio" }
      ]
    }
  ];

  return (
    <>
      <SEO 
        title="Portfolio — MVPs, SaaS & AI Products We've Built | Nowic Studio"
        description="Explore our portfolio of MVPs, SaaS platforms, AI web applications, and custom digital products. Real products, real impact — built with precision and purpose."
        canonicalUrl="https://www.nowicstdio.tech/portfolio"
        keywords="software development portfolio, MVP case studies, SaaS product examples, AI app portfolio, web development work samples, custom software projects"
        schema={portfolioSchema}
      />
      {/* Hero */}
      <section className="relative py-20">
        <div
          className="pointer-events-none absolute inset-x-0 -top-20 h-60"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(52,217,154,0.06) 0%, transparent 70%)' }}
        />
        <div className="container-shell relative">
          <Breadcrumbs items={[{ label: 'Portfolio', path: '/portfolio' }]} />
          <SectionHeading
            as="h1"
            eyebrow="Portfolio"
            title="Selected products from |our studio"
            description="Real products. Real impact. Each built with precision and purpose."
          />
          <div className="mt-8 flex justify-center">
            <Link to="/booking" className="outline-btn">
              Book a Call
            </Link>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="container-shell pb-6">
        <ScrollReveal>
          <div className="max-w-md mx-auto mb-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by keyword, tech, or title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-text placeholder-muted focus:outline-none focus:border-mint/40 transition-colors"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                id={`filter-${category.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setActiveCategory(category)}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 ${activeCategory === category
                    ? 'bg-mint text-bg font-semibold'
                    : 'bg-surface text-sub border border-subtle hover:text-text'
                  }`}
              >
                {category === 'all' ? 'All' : formatCategory(category)}
              </button>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Grid */}
      <section className="container-shell pb-20">
        {error ? (
          <ErrorMessage message={error} />
        ) : loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner text="Loading portfolio..." />
          </div>
        ) : null}

        <motion.div layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {!loading && !error && (
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.title}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="w-full"
              >
                <CaseStudyCard project={item} index={i} isVisible={true} />
              </motion.div>
            ))}
          </AnimatePresence>
          )}
        </motion.div>

        {!loading && !error && filtered.length === 0 && (
          <p className="mt-12 text-center text-muted">No projects in this category yet.</p>
        )}
      </section>

      {/* CTA */}
      <section className="container-shell pb-20">
        <ScrollReveal>
          <div className="rounded-2xl bg-panel p-10 text-center sm:p-14" style={{ border: '1px solid #1e2028' }}>
            <p className="eyebrow">Your Project Next</p>
            <h3 className="mt-4 font-display text-3xl font-bold text-text sm:text-4xl">
              Want your product in <span className="text-gradient">our portfolio?</span>
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-sub">
              Let's build something incredible together.
            </p>
            <a href="/contact" className="cta-btn mt-8 inline-flex px-8 py-3.5">
              Start a Conversation <ArrowUpRight size={15} className="ml-2" />
            </a>
            <Link to="/booking" className="outline-btn mt-4 inline-flex px-8 py-3.5">
              Book a Call
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
