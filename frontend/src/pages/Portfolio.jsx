import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Github } from 'lucide-react';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import { api, BASE_URL } from '../lib/api';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

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
  const { data: allProjects, loading, error } = useApi(() => api.getPortfolio());

  const projects = Array.isArray(allProjects) ? [...allProjects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];
  const categories = ['all', ...new Set(projects.map((p) => p.category).filter(Boolean))];
  const filtered = activeCategory === 'all' ? projects : projects.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="relative py-20">
        <div
          className="pointer-events-none absolute inset-x-0 -top-20 h-60"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(52,217,154,0.06) 0%, transparent 70%)' }}
        />
        <div className="container-shell relative">
          <SectionHeading
            eyebrow="Portfolio"
            title="Selected products from |our studio"
            description="Real products. Real impact. Each built with precision and purpose."
          />
        </div>
      </section>

      {/* Filters */}
      <section className="container-shell pb-6">
        <ScrollReveal>
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

        <motion.div layout className="grid gap-4 md:grid-cols-2">
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
              >
                <motion.article
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="card group overflow-hidden h-full"
                >
                  {/* Preview */}
                  <div className="relative h-48 overflow-hidden bg-surface">
                    {resolveImageUrl(item.image_url) ? (
                      <img
                        src={resolveImageUrl(item.image_url)}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                    )}
                    <div className="absolute inset-0 bg-bg/55 backdrop-blur-[1px]" />
                    <span className="absolute left-4 top-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                      {item.category}
                    </span>
                    {item.is_featured && (
                      <span className="absolute right-3 top-3 rounded-full bg-mint/10 px-2.5 py-0.5 text-[10px] font-semibold text-mint">
                        Featured
                      </span>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-bg/60 backdrop-blur-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <a href={item.live_url} className="portfolio-btn text-xs" target="_blank" rel="noopener noreferrer">
                        <ArrowUpRight size={13} className="mr-1" /> Demo
                      </a>
                      <a href={item.github_url} className="portfolio-btn text-xs" target="_blank" rel="noopener noreferrer">
                        <Github size={13} className="mr-1" /> Code
                      </a>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-text">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-sub">{item.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(item.tech_stack || []).map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </motion.article>
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
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
