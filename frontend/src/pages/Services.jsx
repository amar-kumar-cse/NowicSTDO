import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import InteractiveCard from '../components/ui/InteractiveCard';
import Magnetic from '../components/ui/Magnetic';
import { useState } from 'react';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

function resolveIcon(name) {
  return Icons[name] || Icons.Code2;
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(numeric);
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
  const { data: services, loading, error } = useApi(() => api.getServices());
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

  const orderedServices = Array.isArray(services) ? [...services].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];

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
            eyebrow="Services"
            title="End-to-end product |execution"
            description="From idea to launch — we handle strategy, design, development, and delivery so you can focus on growth."
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
              <ScrollReveal key={service.title} delay={i * 0.06}>
                <InteractiveCard className="feature-card h-full">
                  <div className="icon-box mb-4">
                    <Icon size={18} />
                  </div>
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
                      to="/contact"
                      className="mt-8 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-mint opacity-0 transition-all duration-300 group-hover/inter:opacity-100 group-focus-within/inter:opacity-100 focus:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0f14]"
                    >
                      Start Project <ArrowRight size={14} />
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
