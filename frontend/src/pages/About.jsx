import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import BrandLogo from '../components/common/BrandLogo';
import { useContent } from '../context/ContentContext';

const defaultMilestones = [
  { year: '2023', title: 'Studio Founded', desc: 'Nowic Studio was born from a belief: great products deserve great execution.' },
  { year: '2024', title: '25+ Projects', desc: 'Expanded to full-stack platforms, AI apps, and healthcare solutions.' },
  { year: '2025', title: 'AI-First', desc: 'Integrated AI workflows for 3× faster product delivery.' },
  { year: '2026', title: '50+ & Growing', desc: 'Serving founders and enterprises across India and globally.' },
];

const whyUs = [
  { title: 'Execution-First Process', desc: 'We ship in tight sprints with clear milestones — no delays, no excuses.', icon: CheckCircle2 },
  { title: 'Senior-Level Code Quality', desc: 'Every project uses clean architecture, proper patterns, and scalable structure.', icon: CheckCircle2 },
  { title: 'AI-Augmented Speed', desc: 'We leverage AI workflows to deliver 3× faster without compromising quality.', icon: CheckCircle2 },
  { title: 'Premium UI from Day 1', desc: 'Your product will look and feel premium — because first impressions win customers.', icon: CheckCircle2 },
  { title: 'Transparent Collaboration', desc: 'Weekly demos, direct founder access, clear progress — you\'re never in the dark.', icon: CheckCircle2 },
  { title: 'Architecture That Scales', desc: 'We build for today and tomorrow — clean code that grows with your business.', icon: CheckCircle2 },
];

const teamValues = [
  'Speed without sacrificing quality',
  'Outcome-driven engineering',
  'Client transparency above all',
  'Continuous improvement mindset',
];

export default function About() {
  const { content = {} } = useContent();
  const brand = content.brand || {};
  const milestones = content.milestones || defaultMilestones;
  const whyUsItems = content.whyUs || whyUs;
  const teamValueItems = content.teamValues || teamValues;
  const brandName = brand.name || 'Nowic Studio';
  const tagline = brand.tagline || 'Vision to Version';

  return (
    <>
      {/* Hero */}
      <section className="relative py-20">
        <div
          className="pointer-events-none absolute inset-x-0 -top-20 h-60"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(52,217,154,0.06) 0%, transparent 70%)' }}
        />
        <div className="container-shell relative">
          <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <ScrollReveal>
              <p className="eyebrow">About Us</p>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-text sm:text-5xl">
                We are builders{' '}
                <span className="text-gradient">obsessed with outcomes</span>
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-sub">
                {brandName} partners with founders and teams to design, build, and launch high-performance digital products — faster than you think possible.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/contact" className="cta-btn">
                  Work With Us <ArrowRight size={15} className="ml-2" />
                </Link>
                <Link to="/portfolio" className="outline-btn">View Our Work</Link>
              </div>
            </ScrollReveal>

            {/* Brand card */}
            <ScrollReveal delay={0.1}>
              <div className="card p-7 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-surface">
                  <BrandLogo variant="full" className="h-16 w-16" />
                </div>
                <p className="font-display text-xl font-bold text-text">{brandName}</p>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">{tagline}</p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  {[
                    { val: '50+', label: 'Projects' },
                    { val: '98%', label: 'Satisfaction' },
                    { val: '21d', label: 'Avg Launch' },
                    { val: '3+', label: 'Years' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-surface p-3">
                      <p className="font-display text-lg font-bold text-text">{s.val}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* What makes us different */}
      <section className="py-20">
        <div className="divider mb-20" />
        <div className="container-shell">
          <SectionHeading
            eyebrow="Our Philosophy"
            title="What makes us |different"
            description="We don't just write code — we engineer outcomes with craft and clarity."
          />
          <div className="mt-12 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {whyUsItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.title} delay={i * 0.06}>
                  <div className="card p-5 h-full">
                    <div className="icon-box mb-3">
                      <Icon size={16} />
                    </div>
                    <h3 className="font-display text-sm font-bold text-text">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-sub">{item.desc}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="divider mb-20" />
        <div className="container-shell">
          <SectionHeading
            eyebrow="Our Journey"
            title={`The |${brandName}| story`}
          />
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="relative pl-12">
              {/* Line */}
              <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

              <div className="space-y-8">
                {milestones.map((m, i) => (
                  <ScrollReveal key={m.year} delay={i * 0.08}>
                    <div className="relative">
                      <div className="absolute -left-12 flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-xs font-bold text-mint">
                        '{m.year.slice(2)}
                      </div>
                      <div className="card p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mint">{m.year}</p>
                        <h3 className="mt-1 font-display text-base font-bold text-text">{m.title}</h3>
                        <p className="mt-1 text-sm text-sub">{m.desc}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-shell py-20">
        <ScrollReveal>
          <div className="rounded-2xl bg-panel p-10 sm:p-12" style={{ border: '1px solid #1e2028' }}>
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <p className="eyebrow">Our Values</p>
                <h2 className="mt-4 font-display text-3xl font-bold text-text">
                  Principles we build by
                </h2>
                <p className="mt-3 text-sub">
                  Every decision is guided by these core principles.
                </p>
              </div>
              <ul className="space-y-3">
                {teamValueItems.map((v, i) => (
                  <motion.li
                    key={typeof v === 'string' ? v : v.id || v.text}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 size={16} className="shrink-0 text-mint" />
                    <span className="text-sm font-medium text-text">{typeof v === 'string' ? v : v.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
