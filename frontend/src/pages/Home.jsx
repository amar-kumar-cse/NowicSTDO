import { useEffect, useRef, useMemo, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Github,
  ArrowRight,
  CheckCircle2,
  Star,
  Trophy,
  Code2,
  Users,
  Rocket,
  Bot,
  Sparkles,
  Layers,
  BookOpen,
  Calendar,
} from 'lucide-react';
import SEO from '../components/SEO';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';

// Lazy load heavy purely decorative components
const FloatingChips = lazy(() => import('../components/hero/FloatingChips'));
const HeroDecor = lazy(() => import('../components/hero/HeroDecor'));
const FloatingPanels = lazy(() => import('../components/ui/FloatingPanels'));
import BrandTitle from '../components/common/BrandTitle';
import InteractiveCard from '../components/ui/InteractiveCard';
import Magnetic from '../components/ui/Magnetic';
import MaskText from '../components/reveal/MaskText';
import BoutiqueReveal from '../components/reveal/BoutiqueReveal';
import CTASection from '../components/common/CTASection';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useContent } from '../context/ContentContext';
import { BASE_URL, api } from '../lib/api';
import { brand, services as fallbackServices } from '../data/content';

/* ── Mobile detection (avoids heavy decorative render on phones) ── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

/* ── Counter hook ── */
function useCountUp(target, duration = 1.4) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const isNum = /^\d+/.test(String(target));
    if (!isNum) { node.textContent = target; return; }
    const num = parseFloat(target);
    const suffix = String(target).replace(/[\d.]/g, '');
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      const e = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.round(e * num) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return ref;
}

import { resolveIcon } from '../lib/icons';

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(numeric);
}

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mapFallbackService(service, index) {
  // The new fallback in content.js is already fully normalized.
  return {
    slug: service.slug || toSlug(service.name || service.title || `service-${index + 1}`),
    name: service.name || service.title || '',
    tagline: service.tagline || service.headline || '',
    description: service.description || '',
    features: Array.isArray(service.features) ? service.features : [],
    icon_name: service.icon_name || 'Code2',
    image_url: service.image_url || null,
    price_starting: service.price_starting ?? null,
    delivery_days: service.delivery_days ?? null,
    order: service.order ?? index,
    id: service.id || service.slug || toSlug(service.name || service.title || `service-${index + 1}`),
  };
}

function StatCard({ item, index, loading }) {
  const ref = useCountUp(item.value);
  const Icon = item.icon;
  return (
    <ScrollReveal delay={index * 0.08}>
      <div className="stats-glass p-6 text-center">
        <div className="icon-box mx-auto mb-3">
          <Icon size={16} />
        </div>
        <p ref={ref} className="number-stat">{loading ? '...' : item.value}</p>
        <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{item.label}</p>
      </div>
    </ScrollReveal>
  );
}

export default function Home() {
  const { content, loading } = useContent();
  const isMobile = useIsMobile();
  const services = content?.services || [];
  const portfolioItems = content?.portfolioItems || content?.portfolio || [];
  const statsLoading = loading;
  const servicesLoading = loading;
  const servicesError = null;
  const portfolioLoading = loading;
  const portfolioError = null;

  const [blogPosts, setBlogPosts] = useState([]);
  const [blogLoading, setBlogLoading] = useState(true);

  useEffect(() => {
    api.public_getBlogs()
      .then(res => { if (res.success) setBlogPosts((res.data || []).slice(0, 3)); })
      .catch(() => {})
      .finally(() => setBlogLoading(false));
  }, []);

  // Dispatch prerender event when all data is loaded
  useEffect(() => {
    if (!loading && !blogLoading) {
      setTimeout(() => document.dispatchEvent(new Event('prerender-trigger')), 150);
    }
  }, [loading, blogLoading]);

  const apiHighlights = Array.isArray(content?.highlights) ? content.highlights : [];
  const liveStats = content?.liveStats || {};

  const statCards = apiHighlights.length > 0
    ? apiHighlights
    : [
        { icon: Star,   label: 'Projects Delivered', value: `${liveStats?.projects_delivered ?? 0}` },
        { icon: Trophy, label: 'Happy Clients',       value: `${liveStats?.happy_clients ?? 0}` },
        { icon: Code2,  label: 'Services',            value: `${liveStats?.services_offered ?? 0}` },
        { icon: Users,  label: 'Team Members',        value: `${liveStats?.team_members ?? 0}` },
      ];

  const whyUs = useMemo(() => [
    { title: 'Execution-First Process',    desc: 'We ship in tight sprints with clear milestones — no delays, no excuses.',                           icon: Rocket   },
    { title: 'Senior-Level Code Quality',  desc: 'Every project uses clean architecture, proper patterns, and scalable structure.',                   icon: Code2    },
    { title: 'AI-Augmented Speed',         desc: 'We leverage AI workflows to deliver 3× faster without compromising quality.',                       icon: Bot      },
    { title: 'Premium UI from Day 1',      desc: 'Your product will look and feel premium — because first impressions win customers.',                 icon: Sparkles },
    { title: 'Transparent Collaboration',  desc: "Weekly demos, direct founder access, clear progress — you're never in the dark.",                  icon: Users    },
    { title: 'Architecture That Scales',   desc: 'We build for today and tomorrow — clean code that grows with your business.',                       icon: Layers   },
  ], []);

  const apiServices = Array.isArray(services) ? [...services].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];
  const visibleServices = apiServices.length ? apiServices : fallbackServices.map(mapFallbackService);
  const featuredProjects = Array.isArray(portfolioItems) ? [...portfolioItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).slice(0, 4) : [];

  const brand = content?.brand || {};
  const sameAsLinks = [brand.linkedin, brand.github, brand.twitter, brand.instagram].filter(Boolean);

  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.nowicstdio.tech/#organization",
        "name": "Nowic Studio",
        "alternateName": ["Nowic", "NowicStdio"],
        "url": "https://www.nowicstdio.tech/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.nowicstdio.tech/image.png",
          "width": 512,
          "height": 512
        },
        "description": "Nowic Studio is a software agency that builds MVPs, SaaS platforms, AI-integrated apps, and premium web products for startups and growing businesses.",
        "foundingDate": "2024",
        "email": brand.email || "nowicstdo@gmail.com",
        "areaServed": "Worldwide",
        "knowsAbout": ["MVP Development", "SaaS Platforms", "AI Applications", "React", "Python", "Django", "Next.js", "Web Design", "API Development"],
        "sameAs": sameAsLinks.length > 0 ? sameAsLinks : [
          "https://github.com",
          "https://linkedin.com",
          "https://twitter.com"
        ],
        "founder": {
          "@type": "Person",
          "name": "Saqulain Haider",
          "jobTitle": "Founder & Lead Engineer",
          "url": "https://www.nowicstdio.tech/about"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://www.nowicstdio.tech/#website",
        "url": "https://www.nowicstdio.tech/",
        "name": "Nowic Studio",
        "description": "Premium software agency for startups and businesses",
        "publisher": { "@id": "https://www.nowicstdio.tech/#organization" }
      },
      {
        "@type": "ProfessionalService",
        "@id": "https://www.nowicstdio.tech/#service",
        "name": "Nowic Studio",
        "url": "https://www.nowicstdio.tech/",
        "image": "https://www.nowicstdio.tech/image.png",
        "description": "We design and build software products — MVPs, SaaS platforms, AI tools, and custom web applications — with a focus on speed, quality, and business outcomes.",
        "priceRange": "$$",
        "currenciesAccepted": "USD, INR",
        "paymentAccepted": "Online payment",
        "areaServed": "Worldwide",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Software Development Services",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "MVP Development", "description": "Build a launch-ready MVP in 4–6 weeks." } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "SaaS Platform Development", "description": "Full-stack SaaS products with auth, payments, and dashboards." } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "AI App Integration", "description": "Integrate LLMs, AI agents, and semantic search into your product." } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Business Website", "description": "Premium marketing websites that convert visitors into clients." } }
          ]
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How long does it take to build an MVP?",
            "acceptedAnswer": { "@type": "Answer", "text": "Nowic Studio delivers most MVPs in 4 to 6 weeks depending on scope. We follow a sprint-based process with weekly demos so you can see progress throughout." }
          },
          {
            "@type": "Question",
            "name": "What technologies does Nowic Studio use?",
            "acceptedAnswer": { "@type": "Answer", "text": "We primarily use React, Next.js, and Vite for frontend, Django and Node.js for backend APIs, PostgreSQL and Supabase for databases, and integrate AI features using OpenAI, Claude, and vector search tools." }
          },
          {
            "@type": "Question",
            "name": "How much does it cost to build a SaaS with Nowic Studio?",
            "acceptedAnswer": { "@type": "Answer", "text": "Our SaaS MVP Development service starts from $5,999. Pricing varies based on features, integrations, and timeline. Book a free intro call to get a project-specific quote." }
          },
          {
            "@type": "Question",
            "name": "Does Nowic Studio work with international clients?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. Nowic Studio works with clients worldwide. Our team is async-friendly and provides weekly update calls, shared dashboards, and direct founder access throughout the project." }
          },
          {
            "@type": "Question",
            "name": "Can Nowic Studio add AI features to an existing app?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. We specialize in integrating AI features into existing applications — including chatbots, LLM-powered search, content generation, and automation workflows using GPT-4, Claude, and custom fine-tuned models." }
          }
        ]
      }
    ]
  };

  return (
    <>
      <SEO 
        title="Nowic Studio | MVP & SaaS Development Agency — AI-Powered Software"
        description="Nowic Studio builds premium MVPs, SaaS platforms, and AI-powered apps for startups — shipped in 4–6 weeks. India-based agency serving clients worldwide. Book a free intro call today."
        canonicalUrl="https://www.nowicstdio.tech/"
        keywords="MVP development agency, SaaS development company, AI web app development, custom software development India, startup software agency, build MVP fast, hire software agency, React Django development, AI integration services, software development company"
        schema={homeSchema}

      />
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden" style={{ minHeight: '700px' }}>
        {/* Spotlight beams + grid lines (local to Hero) */}
        <Suspense fallback={null}><HeroDecor /></Suspense>

        {/* Premium Floating Software Backgrounds — desktop only for performance */}
        {!isMobile && (
          <Suspense fallback={null}>
            <FloatingPanels panels={[
              { variant: 'analytics', top: '15%', right: '-2%', width: '280px', opacity: 0.18, delay: 0 },
              { variant: 'code', bottom: '20%', left: '-5%', width: '260px', opacity: 0.15, delay: 2 }
            ]} parallaxStrength={0.015} />
          </Suspense>
        )}

        {/* Floating tech chips — desktop only for performance */}
        {!isMobile && <Suspense fallback={null}><FloatingChips /></Suspense>}

        <BoutiqueReveal delay={0.6} priority={true} className="container-shell relative z-10 flex flex-col items-center justify-center text-center pt-28 pb-28 lg:pt-36 lg:pb-36">
          <div className="flex flex-col items-center">
            {/* Entry eyebrow */}
            <MaskText delay={0.1} priority={true}>
              <h1 className="eyebrow m-0">AI-Powered Software Agency</h1>
            </MaskText>

            <BrandTitle className="mt-5 text-6xl sm:text-7xl lg:text-[88px]" />

            {/* Tagline — styled subtitle */}
            <MaskText delay={0.7} priority={true} className="mt-6">
              <p className="flex items-center justify-center gap-2 text-base font-medium tracking-tight text-mint/90 sm:text-xl">
                <span className="h-px w-6 bg-mint/30" />
                {brand.tagline}.
                <span className="h-px w-6 bg-mint/30" />
              </p>
            </MaskText>

            {/* Thin divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="mt-5 h-px w-24"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(52,217,154,0.5), transparent)' }}
            />

            <MaskText delay={0.8} className="mt-8">
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-sub sm:text-lg md:text-xl">
                We build MVPs, <span className="font-bold text-text">AI web</span> apps, business <span className="font-bold text-text">websites</span> and dashboards <br className="hidden md:block" />
                — shipped in days, not months.
              </p>
            </MaskText>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.2 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Magnetic>
                <Link to="/contact" className="cta-btn">
                  Launch Your Project <ArrowRight size={15} className="ml-2" />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link to="/portfolio" className="outline-btn">
                  View Our Work
                </Link>
              </Magnetic>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-8 flex flex-wrap justify-center gap-5"
            >
              {['30+ Projects', '98% Satisfaction', 'India Based'].map((b) => (
                <span key={b} className="flex items-center gap-2 text-xs text-muted">
                  <CheckCircle2 size={12} className="text-mint" />
                  {b}
                </span>
              ))}
            </motion.div>
          </div>
        </BoutiqueReveal>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="py-12">
        <div className="container-shell">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statCards.map((item, i) => (
              <StatCard key={item.label} item={item} index={i} loading={statsLoading} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section className="relative overflow-hidden py-24">
        {/* Layered spotlights — medium mint for glass refraction */}
        <div className="pointer-events-none absolute -top-20 left-[5%] h-80 w-80 rounded-full bg-mint/[0.12] blur-[100px] z-0" />
        <div className="pointer-events-none absolute top-1/2 right-[8%] h-64 w-64 rounded-full bg-white/[0.05] blur-[80px] z-0" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-72 w-72 rounded-full bg-emerald/[0.1] blur-[100px] z-0" />
        
        {/* Engineering grid and floating panels — desktop only */}
        <div className="engineering-grid" />
        {!isMobile && (
          <Suspense fallback={null}>
            <FloatingPanels panels={[
              { variant: 'code', top: '15%', right: '-4%', width: '320px', opacity: 0.22, delay: 0 },
              { variant: 'github', bottom: '10%', left: '0%', width: '340px', opacity: 0.2, delay: 1.5 }
            ]} parallaxStrength={0.01} />
          </Suspense>
        )}

        <div className="container-shell relative z-10">
          <SectionHeading
            eyebrow="Services"
            title="Built for speed. |Crafted for growth."
            description="Every product we ship is engineered for momentum, market-fit, and long-term scale."
          />

          {servicesError ? (
            <ErrorMessage message={servicesError} />
          ) : servicesLoading ? (
            <div className="mt-12 flex justify-center py-16">
              <LoadingSpinner text="Loading services..." />
            </div>
          ) : (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleServices.slice(0, 6).map((service, i) => {
              const Icon = resolveIcon(service.icon_name);
              return (
                <ScrollReveal key={service.slug} delay={i * 0.06}>
                  <InteractiveCard className="feature-card h-full">
                    <div className="icon-box mb-4">
                      <Icon size={18} />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mint">
                      {service.name}
                    </p>
                    <h3 className="mt-1.5 font-display text-lg font-bold text-text">{service.tagline}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-sub">{service.description}</p>

                      <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.14em] text-muted">
                        {service.price_starting !== null && service.price_starting !== undefined && (
                          <span className="rounded-full bg-white/5 px-2.5 py-1 text-mint">From ₹{formatCurrency(service.price_starting)}</span>
                        )}
                        {service.delivery_days !== null && service.delivery_days !== undefined && (
                          <span className="rounded-full bg-white/5 px-2.5 py-1">{service.delivery_days} days</span>
                        )}
                      </div>

                      <ul className="mt-4 space-y-1.5 flex-1">
                        {(service.features || []).map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-muted">
                            <CheckCircle2 size={11} className="text-mint shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-6 flex items-center justify-between">
                        <Link to={service.slug ? `/services/${service.slug}` : `/services/${toSlug(service.name || service.title)}`} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-mint opacity-80 group-hover:opacity-100 hover:text-white transition-all">
                          Explore {service.name} <ArrowRight size={12} />
                        </Link>
                      </div>
                    </InteractiveCard>
                </ScrollReveal>
              );
            })}
          </div>
          )}
        </div>
      </section>

      {/* ═══ WHY US ═══ */}
      <section className="py-24 relative overflow-hidden">
        {/* Spotlights — soft ambient lighting */}
        <div className="pointer-events-none absolute top-0 right-[10%] h-96 w-96 rounded-full bg-mint/[0.08] blur-[120px] z-0" />
        <div className="pointer-events-none absolute bottom-0 left-[5%] h-64 w-64 rounded-full bg-white/[0.06] blur-[80px] z-0" />
        
        {/* Engineering grid and AI workflow panels — desktop only */}
        <div className="engineering-grid" />
        {!isMobile && (
          <Suspense fallback={null}>
            <FloatingPanels panels={[
              { variant: 'ai', top: '25%', right: '15%', width: '320px', opacity: 0.25, delay: 0.5 }
            ]} parallaxStrength={0.02} />
          </Suspense>
        )}

        <div className="container-shell relative z-10">
          <div className="grid gap-16 lg:grid-cols-[380px_1fr]">
            {/* Left sticky */}
            <ScrollReveal className="lg:sticky lg:top-24 lg:h-fit">
              <p className="eyebrow">Why Choose Us</p>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-text sm:text-[2.5rem] sm:leading-[1.15]">
                Premium quality with{' '}
                <span className="text-gradient">startup speed</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-sub/90">
                Senior engineering discipline combined with AI-powered speed — products that look amazing and scale effortlessly.
              </p>
              <Link to="/services" className="cta-btn mt-8 inline-flex">
                Explore Services <ArrowRight size={15} className="ml-2" />
              </Link>
            </ScrollReveal>

            {/* Cards grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {whyUs.map((item, i) => {
                const Icon = item.icon;
                return (
                  <ScrollReveal key={item.title} delay={i * 0.06}>
                    <InteractiveCard className="p-5 h-full">
                      <div className="icon-box mb-3">
                        <Icon size={16} />
                      </div>
                      <h3 className="font-display text-sm font-bold text-text">{item.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-sub">{item.desc}</p>
                    </InteractiveCard>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURED WORK ═══ */}
      <section className="relative overflow-hidden py-20">
        <div className="engineering-grid" />
        {!isMobile && (
          <Suspense fallback={null}>
            <FloatingPanels panels={[
              { variant: 'mobile', top: '35%', right: '-2%', width: '220px', opacity: 0.3, delay: 1 },
              { variant: 'analytics', bottom: '15%', left: '2%', width: '300px', opacity: 0.22, delay: 2.5 }
            ]} parallaxStrength={0.015} />
          </Suspense>
        )}

        <div className="container-shell relative z-10">
          <SectionHeading
          eyebrow="Portfolio"
          title="Work that proves |capability"
          description="Real products. Real impact. Each built with precision and purpose."
        />

        {portfolioError ? (
          <ErrorMessage message={portfolioError} />
        ) : portfolioLoading ? (
          <div className="mt-12 flex justify-center py-16">
            <LoadingSpinner text="Loading portfolio..." />
          </div>
        ) : (
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {featuredProjects.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.07}>
              <InteractiveCard className="group overflow-hidden h-full p-0">
                {/* Preview area */}
                <div className="relative h-44 overflow-hidden bg-surface/30 border-b border-white/5">
                  {resolveImageUrl(item.image_url) ? (
                    <img
                      src={resolveImageUrl(item.image_url)}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                  )}
                  <div className="absolute inset-0 bg-bg/30" />
                  <span className="absolute left-4 top-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                    {item.category}
                  </span>
                  {item.is_featured && (
                    <span className="absolute right-3 top-3 rounded-full bg-mint/10 px-2.5 py-0.5 text-[10px] font-semibold text-mint">
                      Featured
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-text">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-sub">{item.description}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(item.tech_stack || []).map((tag) => (
                      <span key={tag} className="tag bg-white/5">{tag}</span>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-3">
                    {item.live_url && (
                      <Magnetic strength={0.2}>
                        <a href={item.live_url} className="portfolio-btn text-xs" target="_blank" rel="noopener noreferrer">
                          Live Demo <ArrowUpRight size={12} className="ml-1" />
                        </a>
                      </Magnetic>
                    )}
                    {item.github_url && (
                      <Magnetic strength={0.2}>
                        <a href={item.github_url} className="portfolio-btn text-xs" target="_blank" rel="noopener noreferrer">
                          GitHub <Github size={12} className="ml-1" />
                        </a>
                      </Magnetic>
                    )}
                  </div>
                </div>
              </InteractiveCard>
            </ScrollReveal>
          ))}
        </div>
        )}

        <ScrollReveal className="mt-8 text-center" delay={0.15}>
          <Link to="/portfolio" className="outline-btn">
            View All Projects <ArrowRight size={14} className="ml-2" />
          </Link>
        </ScrollReveal>
        </div>
      </section>

      {/* ═══ CUSTOMER REVIEWS ═══ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,217,154,0.04)_0%,transparent_65%)]" />
        <div className="engineering-grid" />

        <div className="container-shell relative z-10">
          <SectionHeading
            eyebrow="Testimonials"
            title="What our clients |say"
            description="Don't just take our word for it. Hear from the founders and creators we've partnered with."
          />

          {content?.reviews && content.reviews.length > 0 ? (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {content.reviews.map((review, i) => (
                <ScrollReveal key={review.id} delay={i * 0.06}>
                  <InteractiveCard className="h-full flex flex-col justify-between p-6 bg-[#0e0f14]/80 backdrop-blur-sm border border-white/5">
                    <div>
                      <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            size={14}
                            className={star <= review.rating ? "fill-[#34d99a] text-[#34d99a]" : "fill-transparent text-[#2a2c36]"}
                          />
                        ))}
                      </div>
                      <p className="text-[#e0e0e8] text-sm leading-relaxed mb-6 italic">"{review.review_text}"</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {review.avatar_url ? (
                        <img src={review.avatar_url} alt={review.client_name} loading="lazy" decoding="async" className="w-10 h-10 rounded-full object-cover bg-[#1e2028]" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#1e2028] flex items-center justify-center text-[#6b6f80] text-sm font-bold uppercase">
                          {review.client_name.substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-[#f0f0f3] text-sm">{review.client_name}</div>
                        {(review.role || review.company) && (
                          <div className="text-xs text-[#8b8fa3]">
                            {review.role}{review.role && review.company && ' at '}{review.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </InteractiveCard>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            /* Social proof fallback — always shows even with no reviews */
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {[
                { quote: "The team delivered our MVP in under 5 weeks. The quality was outstanding and we launched ahead of schedule.", name: "Startup Founder", role: "SaaS Product, India", initials: "SF", rating: 5 },
                { quote: "Incredibly talented engineers. They understood our vision immediately and brought it to life with a premium UI.", name: "Product Manager", role: "E-Commerce Platform, UAE", initials: "PM", rating: 5 },
                { quote: "Best investment we made. The AI integration they built saved us 20+ hours per week in manual work.", name: "Business Owner", role: "AI Tool, USA", initials: "BO", rating: 5 },
              ].map((review, i) => (
                <ScrollReveal key={i} delay={i * 0.07}>
                  <InteractiveCard className="h-full flex flex-col justify-between p-6 border border-white/5 bg-[#0e0f14]/80 relative overflow-hidden">
                    <div className="absolute top-3 right-4 text-[#34d99a]/10 font-display text-[80px] font-black leading-none select-none">"</div>
                    <div>
                      <div className="flex gap-1 mb-4">
                        {[1,2,3,4,5].map(s => <Star key={s} size={13} className="fill-[#34d99a] text-[#34d99a]" />)}
                      </div>
                      <p className="text-[#cbd5e1] text-sm leading-relaxed italic mb-6">"{review.quote}"</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#34d99a]/20 to-[#6366f1]/20 flex items-center justify-center text-[#34d99a] text-xs font-black uppercase border border-[#34d99a]/20">
                        {review.initials}
                      </div>
                      <div>
                        <div className="font-bold text-[#f0f0f3] text-sm">{review.name}</div>
                        <div className="text-xs text-[#8b8fa3]">{review.role}</div>
                      </div>
                    </div>
                  </InteractiveCard>
                </ScrollReveal>
              ))}
            </div>
          )}

          <ScrollReveal className="mt-8 text-center" delay={0.2}>
            <Link to="/review" className="inline-flex items-center gap-2 text-xs font-bold text-[#34d99a] uppercase tracking-widest hover:text-white transition-colors">
              Share Your Experience <ArrowRight size={14} />
            </Link>
          </ScrollReveal>
        </div>
      </section>



      {/* ═══ FROM THE BLOG ═══ */}
      {(blogLoading || blogPosts.length > 0) && (
      <section className="py-24 relative overflow-hidden">
        <div className="engineering-grid" />
        <div className="pointer-events-none absolute top-0 left-1/4 h-72 w-72 rounded-full bg-mint/[0.07] blur-[100px] z-0" />

        <div className="container-shell relative z-10">
          <SectionHeading
            eyebrow="Blog"
            title="From the |Blog"
            description="Practical insights on MVP development, SaaS architecture, and building with AI."
          />

          {blogLoading ? (
            <div className="mt-12 flex justify-center py-8">
              <LoadingSpinner text="Loading articles..." />
            </div>
          ) : (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post, i) => (
                <ScrollReveal key={post.slug} delay={i * 0.07}>
                  <InteractiveCard className="group h-full flex flex-col p-0 overflow-hidden">
                    {/* Cover image */}
                    <Link to={`/blog/${post.slug}`} className="block h-40 w-full shrink-0 overflow-hidden bg-surface/30 border-b border-white/5">
                      {post.cover_image_url ? (
                        <img
                          src={resolveImageUrl(post.cover_image_url)}
                          alt={post.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#3a3e50]">
                          <BookOpen size={32} />
                        </div>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-5 gap-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted">
                        <Calendar size={10} />
                        {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                      <h3 className="font-display text-base font-bold text-text group-hover:text-mint transition-colors line-clamp-2">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-sub leading-relaxed line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="mt-auto pt-3">
                        <Link
                          to={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-mint hover:text-white transition-colors"
                        >
                          Read Article <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </InteractiveCard>
                </ScrollReveal>
              ))}
            </div>
          )}

          <ScrollReveal className="mt-8 text-center" delay={0.15}>
            <Link to="/blog" className="outline-btn">
              View All Articles <ArrowRight size={14} className="ml-2" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
      )}

      {/* ═══ BRAND STATEMENT ═══ */}
      <section className="container-shell py-10">
        <ScrollReveal>
          <div className="hero-glass glass-noise p-10 text-center sm:p-14">
            <p className="mx-auto max-w-3xl font-display text-2xl font-bold leading-snug text-text sm:text-3xl">
              We are {brand.name}.{' '}
              <span className="text-gradient">We build tech that works.</span>{' '}
              For founders, creators, and businesses who need results — not excuses.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ CTA ═══ */}
      <CTASection />
    </>
  );
}
