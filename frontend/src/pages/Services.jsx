import { useEffect as usePrerenderEffect } from 'react';
 import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import Breadcrumbs from '../components/common/Breadcrumbs';
import InteractiveCard from '../components/ui/InteractiveCard';
import Magnetic from '../components/ui/Magnetic';
import { useState } from 'react';
import { useContent } from '../context/ContentContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { services as fallbackServices } from '../data/content';
import { resolveIcon } from '../lib/icons';

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(numeric);
}

function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const LOCAL_SERVICE_IMAGES = {
  mvp: '/services/mvp.jpg',
  'api-development': '/services/api.png',
  api: '/services/api.png',
  dashboard: '/services/dashboard.png',
  saas: '/services/saas.png',
  website: '/services/website.png',
  'business-website': '/services/website.png',
  'ai-web-app': '/services/ai.png',
  ai: '/services/ai.png',
};

import { resolveImageUrl } from '../lib/api';

function getServiceImageUrl(service) {
  const raw = service?.image_url || service?.image || '';
  const trimmed = String(raw).trim();

  if (trimmed) {
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    if (trimmed.startsWith('/media/')) {
      return resolveImageUrl(trimmed);
    }
    return `/${trimmed.replace(/^\/+/, '')}`;
  }

  const slug = toSlug(service?.slug || service?.name || '');
  if (LOCAL_SERVICE_IMAGES[slug]) return LOCAL_SERVICE_IMAGES[slug];

  if (slug.includes('mvp')) return LOCAL_SERVICE_IMAGES.mvp;
  if (slug.includes('api')) return LOCAL_SERVICE_IMAGES.api;
  if (slug.includes('dashboard')) return LOCAL_SERVICE_IMAGES.dashboard;
  if (slug.includes('saas')) return LOCAL_SERVICE_IMAGES.saas;
  if (slug.includes('ai')) return LOCAL_SERVICE_IMAGES.ai;
  if (slug.includes('website') || slug.includes('web')) return LOCAL_SERVICE_IMAGES.website;

  return null;
}

function mapFallbackService(service, index) {
  // The new fallback in content.js is already fully normalized (slug, name, tagline, etc.).
  // Just ensure missing fields have sane defaults.
  return {
    slug: service.slug || toSlug(service.title || `service-${index + 1}`),
    name: service.name || service.title || '',
    tagline: service.tagline || service.headline || '',
    description: service.description || '',
    features: Array.isArray(service.features) ? service.features : [],
    icon_name: service.icon_name || 'Code2',
    image_url: service.image_url || getServiceImageUrl(service),
    price_starting: service.price_starting ?? null,
    delivery_days: service.delivery_days ?? null,
    order: service.order ?? index,
    id: service.id || service.slug || toSlug(service.title || `service-${index + 1}`),
  };
}

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        id={`faq-${index}`}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <span className="text-sm font-semibold text-text">{item.q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.15 }}
          className="shrink-0 text-lg text-muted"
        >
          +
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-sm leading-relaxed text-sub">{item.a}</p>
      </motion.div>
    </div>
  );
}

export default function Services() {
  const { content, loading } = useContent();

  usePrerenderEffect(() => {
    if (!loading) {
      setTimeout(() => document.dispatchEvent(new Event('prerender-trigger')), 150);
    }
  }, [loading]);

  const services = content?.services || [];
  const error = null;
  const faqs = [
    {
      q: 'How long does a typical project take?',
      a: 'Most MVPs and websites are delivered in 7–21 days. Complex SaaS platforms take 4–8 weeks depending on scope.',
    },
    {
      q: 'Do you provide post-launch support?',
      a: 'Yes — we offer ongoing maintenance, feature iterations, and dedicated support packages for all projects.',
    },
    {
      q: 'What tech stack do you use?',
      a: 'Primarily React, Next.js, Node.js, MongoDB and PostgreSQL. We adapt to your stack as needed.',
    },
    {
      q: 'Can you work with an existing codebase?',
      a: 'Absolutely. We audit, refactor, and extend existing codebases with clean, maintainable enhancements.',
    },
  ];

  const apiServices = Array.isArray(services) ? [...services].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];
  const orderedServices = apiServices.length ? apiServices : fallbackServices.map(mapFallbackService);

  const servicesSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "provider": {
        "@type": "Organization",
        "name": "Nowic Studio",
        "url": "https://www.nowicstdio.tech"
      },
      "name": "Software Development Services",
      "description": "End-to-end software development services including MVP development, SaaS platforms, AI app integration, business websites, API development, and admin dashboards.",
      "url": "https://www.nowicstdio.tech/services",
      "areaServed": "Worldwide",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Development Services",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "MVP Development", "description": "Build a launch-ready MVP in 4–6 weeks with React, Django, and modern cloud infrastructure." } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "SaaS Platform Development", "description": "Full-stack SaaS with auth, payments, admin dashboard, and scalable API layer." } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "AI App Integration", "description": "Add GPT-4, Claude, chatbots, RAG pipelines, and semantic search to your product." } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Business Website", "description": "Premium responsive marketing websites optimized for conversions and SEO." } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "API & Backend Development", "description": "Scalable REST/GraphQL APIs with Django, Node.js, PostgreSQL, and Redis." } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Admin Dashboard & CRM", "description": "Custom internal tools, analytics dashboards, and CRM systems." } }
        ]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.nowicstdio.tech/" },
        { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://www.nowicstdio.tech/services" }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": { "@type": "Answer", "text": faq.a }
      }))
    }
  ];

  return (
    <>
      <SEO 
        title="Software Development Services — MVP, SaaS, AI Apps | Nowic Studio"
        description="Nowic Studio offers end-to-end software development services: MVP development, SaaS platforms, AI app integration, business websites, API development, and admin dashboards. Shipped fast with premium quality."
        canonicalUrl="https://www.nowicstdio.tech/services"
        keywords="software development services, MVP development service, SaaS development, AI app integration, custom web development, business website development, API development, admin dashboard development"
        schema={servicesSchema}
      />
      {/* Hero */}
      <section className="relative py-20">
        <div
          className="pointer-events-none absolute inset-x-0 -top-20 h-60"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(52,217,154,0.06) 0%, transparent 70%)' }}
        />
        <div className="container-shell relative">
          <Breadcrumbs items={[{ label: 'Services', path: '/services' }]} />
          <SectionHeading
            as="h1"
            eyebrow="Our Services"
            title="End-to-end |Software Engineering|"
            description="From concept to deployment, we build high-performance MVPs, scalable SaaS platforms, and AI-integrated products."
          />
        </div>
      </section>

      {/* Grid */}
      <section className="container-shell pb-20">
        {error ? (
          <ErrorMessage message={error} />
        ) : loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner text="Loading services..." />
          </div>
        ) : orderedServices.length === 0 ? (
          <p className="py-16 text-center text-muted">No services available.</p>
        ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orderedServices.map((service, i) => {
            const Icon = resolveIcon(service.icon_name);
            return (
              <ScrollReveal key={service.slug || service.name || service.title || i} delay={i * 0.06}>
                <InteractiveCard className="feature-card h-full">
                  {getServiceImageUrl(service) ? (
                    <div className="mb-5 overflow-hidden rounded-xl border border-white/5 bg-surface/30">
                      <img
                        src={getServiceImageUrl(service)}
                        alt={service.name}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        onError={(e) => {
                          const fallback = LOCAL_SERVICE_IMAGES[toSlug(service.slug || service.name)] || LOCAL_SERVICE_IMAGES.website;
                          if (e.currentTarget.src !== new URL(fallback, window.location.origin).href) {
                            e.currentTarget.src = fallback;
                            return;
                          }
                          e.currentTarget.style.display = 'none';
                        }}
                        className="h-40 w-full object-cover transition-transform duration-500 group-hover/inter:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="icon-box mb-4">
                      <Icon size={18} />
                    </div>
                  )}
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mint">
                    {service.name}
                  </p>
                  <h3 className="mt-1.5 font-display text-xl font-bold text-text">{service.tagline}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-sub">{service.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.14em] text-muted">
                    {service.price_starting !== null && service.price_starting !== undefined && (
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-mint">From ₹{formatCurrency(service.price_starting)}</span>
                    )}
                    {service.delivery_days !== null && service.delivery_days !== undefined && (
                      <span className="rounded-full bg-white/5 px-2.5 py-1">{service.delivery_days} days</span>
                    )}
                  </div>
                  <ul className="mt-5 space-y-2">
                    {(service.features || []).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-sub">
                        <CheckCircle2 size={13} className="text-mint shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Magnetic strength={0.2}>
                    <Link
                      to={`/services/${toSlug(service.slug || service.name)}`}
                      className="mt-8 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-mint opacity-0 transition-all duration-300 group-hover/inter:opacity-100 group-focus-within/inter:opacity-100 focus:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0f14]"
                    >
                      View Details <ArrowRight size={14} />
                    </Link>
                  </Magnetic>
                </InteractiveCard>
              </ScrollReveal>
            );
          })}
        </div>
        )}
      </section>

      {/* Process */}
      <section className="py-20">
        <div className="divider mb-20" />
        <div className="container-shell">
          <SectionHeading
            eyebrow="Our Process"
            title="From idea to |launch"
            description="A clear, repeatable framework that delivers results every single time."
          />
          <div className="mt-12 grid gap-1 md:grid-cols-4">
            {[
              { step: '01', title: 'Discovery', desc: 'Understand goals, users, and constraints.' },
              { step: '02', title: 'Architecture', desc: 'Design system, stack, and project roadmap.' },
              { step: '03', title: 'Build', desc: 'Sprint through dev with weekly demos.' },
              { step: '04', title: 'Launch', desc: 'Deploy, test, and hand over with docs.' },
            ].map((p, i) => (
              <ScrollReveal key={p.step} delay={i * 0.08}>
                <div className="p-5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface font-display text-sm font-bold text-mint">
                    {p.step}
                  </span>
                  <h3 className="mt-3 font-display text-base font-bold text-text">{p.title}</h3>
                  <p className="mt-1.5 text-sm text-sub">{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-shell py-20">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked |questions"
          description="Everything you need to know before we start building."
        />
        <div className="mx-auto mt-10 max-w-2xl space-y-2">
          {faqs.map((item, i) => (
            <FAQItem key={item.q} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-shell pb-20">
        <ScrollReveal>
          <div className="rounded-2xl bg-panel p-10 text-center sm:p-16 border border-white/5 relative overflow-hidden">
            {/* Subtle glow behind CTA */}
            <div className="absolute inset-0 bg-mint/5 blur-[120px] pointer-events-none" />

            <p className="eyebrow relative z-10">Let's Build</p>
            <h3 className="mt-4 font-display text-4xl font-bold text-text sm:text-5xl relative z-10">
              Ready to kick off your project?
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-sub relative z-10">
              Tell us your idea. We'll come back with a plan, timeline, and budget — no fluff.
            </p>
            <Magnetic>
              <Link to="/contact" className="cta-btn mt-10 relative z-10">
                Book a Free Discovery Call <ArrowRight size={15} className="ml-2" />
              </Link>
            </Magnetic>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
