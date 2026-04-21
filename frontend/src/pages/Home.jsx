import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ArrowUpRight, Github, ArrowRight, CheckCircle2 } from 'lucide-react';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import FloatingChips from '../components/hero/FloatingChips';
import HeroDecor from '../components/hero/HeroDecor';
import BrandTitle from '../components/common/BrandTitle';
import InteractiveCard from '../components/ui/InteractiveCard';
import Magnetic from '../components/ui/Magnetic';
import MaskText from '../components/reveal/MaskText';
import BoutiqueReveal from '../components/reveal/BoutiqueReveal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useApi } from '../hooks/useApi';
import { api, BASE_URL } from '../lib/api';
import { brand } from '../data/content';

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

function resolveIcon(name) {
  return Icons[name] || Icons.Code2;
}

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

function StatCard({ item, index, loading }) {
  const ref = useCountUp(item.value);
  const Icon = item.icon;
  return (
    <ScrollReveal delay={index * 0.08}>
      <div className="card p-6 text-center">
        <div className="icon-box mx-auto mb-3">
          <Icon size={18} />
        </div>
        <p ref={ref} className="number-stat text-2xl">{loading ? '...' : item.value}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-muted">{item.label}</p>
      </div>
    </ScrollReveal>
  );
}

export default function Home() {
  const { data: stats, loading: statsLoading } = useApi(() => api.getStats());
  const { data: services, loading: servicesLoading, error: servicesError } = useApi(() => api.getServices());
  const { data: portfolioItems, loading: portfolioLoading, error: portfolioError } = useApi(() => api.getPortfolio());

  const statCards = [
    { icon: Icons.Star, label: 'Projects Delivered', value: `${stats?.projects_delivered ?? 0}` },
    { icon: Icons.Trophy, label: 'Happy Clients', value: `${stats?.happy_clients ?? 0}` },
    { icon: Icons.Code2, label: 'Services', value: `${stats?.services_offered ?? 0}` },
    { icon: Icons.Users, label: 'Team Members', value: `${stats?.team_members ?? 0}` },
  ];

  const whyUs = [
    { title: 'Execution-First Process', desc: 'We ship in tight sprints with clear milestones — no delays, no excuses.', icon: Icons.Rocket },
    { title: 'Senior-Level Code Quality', desc: 'Every project uses clean architecture, proper patterns, and scalable structure.', icon: Icons.Code2 },
    { title: 'AI-Augmented Speed', desc: 'We leverage AI workflows to deliver 3× faster without compromising quality.', icon: Icons.Bot },
    { title: 'Premium UI from Day 1', desc: 'Your product will look and feel premium — because first impressions win customers.', icon: Icons.Sparkles },
    { title: 'Transparent Collaboration', desc: 'Weekly demos, direct founder access, clear progress — you\'re never in the dark.', icon: Icons.Users },
    { title: 'Architecture That Scales', desc: 'We build for today and tomorrow — clean code that grows with your business.', icon: Icons.Layers },
  ];

  const visibleServices = Array.isArray(services) ? [...services].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];
  const featuredProjects = Array.isArray(portfolioItems) ? [...portfolioItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).slice(0, 4) : [];

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden" style={{ minHeight: '700px' }}>
        {/* Spotlight beams + grid lines (local to Hero) */}
        <HeroDecor />

        {/* Floating tech chips */}
        <FloatingChips />

        <BoutiqueReveal delay={0.6} className="container-shell relative z-10 flex flex-col items-center justify-center text-center pt-28 pb-28 lg:pt-36 lg:pb-36">
          <div className="flex flex-col items-center">
            {/* Entry eyebrow */}
            <MaskText delay={0.1}>
              <p className="eyebrow">AI-Powered Software Agency</p>
            </MaskText>

            <BrandTitle className="mt-5 text-6xl sm:text-7xl lg:text-[88px]" />

            {/* Tagline — styled subtitle */}
            <MaskText delay={0.7} className="mt-6">
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
      <section className="container-shell py-20">
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

                  <ul className="mt-4 space-y-1.5">
                    {(service.features || []).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted">
                        <CheckCircle2 size={11} className="text-mint shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </InteractiveCard>
              </ScrollReveal>
            );
          })}
        </div>
        )}
      </section>

      {/* ═══ WHY US ═══ */}
      <section className="py-20">
        <div className="container-shell">
          <div className="grid gap-16 lg:grid-cols-[380px_1fr]">
            {/* Left sticky */}
            <ScrollReveal className="lg:sticky lg:top-24 lg:h-fit">
              <p className="eyebrow">Why Choose Us</p>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-text sm:text-4xl">
                Premium quality with{' '}
                <span className="text-gradient">startup speed</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-sub">
                Senior engineering discipline combined with AI-powered speed — products that look amazing and scale effortlessly.
              </p>
              <Link to="/services" className="cta-btn mt-6 inline-flex">
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
      <section className="container-shell py-20">
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
      </section>

      {/* ═══ BRAND STATEMENT ═══ */}
      <section className="container-shell py-8">
        <ScrollReveal>
          <div className="rounded-2xl border border-subtle bg-panel p-10 text-center sm:p-14">
            <p className="mx-auto max-w-3xl font-display text-2xl font-bold leading-snug text-text sm:text-3xl">
              We are {brand.name}.{' '}
              <span className="text-gradient">We build tech that works.</span>{' '}
              For founders, creators, and businesses who need results — not excuses.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="container-shell py-20">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-2xl bg-panel p-10 text-center sm:p-16"
            style={{ border: '1px solid #1e2028' }}
          >
            {/* Subtle green glow at bottom */}
            <div
              className="pointer-events-none absolute inset-x-0 -bottom-20 h-40"
              style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(52,217,154,0.08), transparent 65%)' }}
            />

            <div className="relative">
              <p className="eyebrow">Let's Build</p>
              <h3 className="mt-4 font-display text-3xl font-bold text-text sm:text-4xl">
                Ready to build something{' '}
                <span className="text-gradient">powerful?</span>
              </h3>
              <p className="mx-auto mt-4 max-w-lg text-sub">
                Share your idea and we'll respond within 24 hours with a clear roadmap, timeline, and budget.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link to="/contact" className="cta-btn px-8 py-3.5">
                  Book a Free Discovery Call <ArrowRight size={15} className="ml-2" />
                </Link>
                <Link to="/portfolio" className="outline-btn">See Our Work</Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
