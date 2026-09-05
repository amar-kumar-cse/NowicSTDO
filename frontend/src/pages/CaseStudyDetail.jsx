import { useParams, Link } from 'react-router-dom';
import { caseStudyDetails, toProjectSlug } from '../data/caseStudyDetails';
import SEO from '../components/SEO';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import Breadcrumbs from '../components/common/Breadcrumbs';
import NotFound from './NotFound';
import { ArrowRight, ExternalLink, CheckCircle2, Layers, Clock, Users, Zap, TrendingUp, Quote } from 'lucide-react';

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const study = caseStudyDetails[slug];

  if (!study) {
    return <NotFound />;
  }

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": study.title,
      "description": study.heroSummary,
      "articleSection": "Case Study",
      "author": {
        "@type": "Organization",
        "name": "Nowic Studio",
        "url": "https://www.nowicstdio.tech"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Nowic Studio",
        "logo": { "@type": "ImageObject", "url": "https://www.nowicstdio.tech/image.png" }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.nowicstdio.tech/" },
        { "@type": "ListItem", "position": 2, "name": "Case Studies", "item": "https://www.nowicstdio.tech/case-studies" },
        { "@type": "ListItem", "position": 3, "name": study.title, "item": `https://www.nowicstdio.tech/case-studies/${slug}` }
      ]
    }
  ];

  return (
    <>
      <SEO
        title={`${study.title} — Case Study | Nowic Studio`}
        description={study.heroSummary}
        canonicalUrl={`https://www.nowicstdio.tech/case-studies/${slug}`}
        keywords={`${study.category} case study, ${study.title}, software development case study, Nowic Studio`}
        schema={schema}
      />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#050806]" />
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#34d99a]/5 blur-[120px]" />

        <div className="container-shell relative z-10">
          <Breadcrumbs items={[
            { label: 'Case Studies', path: '/case-studies' },
            { label: study.title, path: `/case-studies/${slug}` }
          ]} />

          <div className="max-w-4xl mx-auto mt-12">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#34d99a] bg-[#34d99a]/10 border border-[#34d99a]/20 px-3 py-1 rounded-full">
                {study.category}
              </span>
              {study.year && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  {study.year}
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl font-extrabold text-[#f0f0f3] leading-tight sm:text-5xl md:text-6xl">
              {study.title}
            </h1>
            <p className="mt-6 text-lg text-[#8b8fa3] leading-relaxed max-w-3xl">
              {study.heroSummary}
            </p>

            {/* Quick stats */}
            <div className="mt-10 flex flex-wrap gap-6">
              {study.client && (
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-muted" />
                  <span className="text-xs text-muted uppercase tracking-widest">Client:</span>
                  <span className="text-sm font-bold text-text">{study.client}</span>
                </div>
              )}
              {study.timeline && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-muted" />
                  <span className="text-xs text-muted uppercase tracking-widest">Timeline:</span>
                  <span className="text-sm font-bold text-text">{study.timeline}</span>
                </div>
              )}
              {study.liveUrl && (
                <a href={study.liveUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-bold text-[#34d99a] hover:text-white transition-colors">
                  <ExternalLink size={14} /> View Live
                </a>
              )}
            </div>

            {/* Tech stack */}
            <div className="mt-6 flex flex-wrap gap-2">
              {study.techStack.map(tag => (
                <span key={tag} className="text-[10px] font-medium text-[#6b6f80] border border-white/5 bg-white/[0.02] px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="py-24 border-t border-white/5 bg-[#0a0b0f]">
        <div className="container-shell max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="grid lg:grid-cols-[0.4fr_1fr] gap-12">
              <div>
                <p className="eyebrow flex items-center gap-2"><Zap size={14} className="text-mint" /> The Challenge</p>
                <h2 className="mt-4 font-display text-3xl font-bold text-text">
                  The <span className="text-mint">Problem</span>
                </h2>
              </div>
              <p className="text-base text-[#8b8fa3] leading-relaxed">
                {study.problem}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Solution ── */}
      <section className="py-24 border-t border-white/5">
        <div className="container-shell max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="grid lg:grid-cols-[0.4fr_1fr] gap-12">
              <div>
                <p className="eyebrow flex items-center gap-2"><Layers size={14} className="text-mint" /> Our Approach</p>
                <h2 className="mt-4 font-display text-3xl font-bold text-text">
                  The <span className="text-mint">Solution</span>
                </h2>
              </div>
              <div>
                <p className="text-base text-[#8b8fa3] leading-relaxed mb-8">
                  {study.solution}
                </p>

                {/* Approach steps */}
                {study.approach && study.approach.length > 0 && (
                  <div className="space-y-4 border-t border-white/5 pt-8">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4">Step-by-step</p>
                    {study.approach.map((step, i) => (
                      <ScrollReveal key={i} delay={i * 0.05}>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#34d99a]/10 text-xs font-bold text-[#34d99a]">
                            {i + 1}
                          </span>
                          <p className="text-sm text-[#cbd5e1] leading-relaxed">{step}</p>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Results ── */}
      <section className="py-24 border-t border-white/5 bg-[#0a0b0f]">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Outcomes"
            title="The |Results"
            description="Measurable impact delivered."
          />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {study.results.map((result, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="card p-8 text-center bg-white/[0.02] border border-white/5 hover:border-mint/20 transition-all">
                  <p className="font-display text-4xl font-extrabold text-[#34d99a]">{result.metric}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted">{result.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial (if available) ── */}
      {study.testimonial && (
        <section className="py-24 border-t border-white/5">
          <div className="container-shell max-w-3xl mx-auto text-center">
            <Quote size={40} className="mx-auto text-[#34d99a]/30 mb-6" />
            <blockquote className="font-display text-2xl font-bold text-text leading-relaxed italic">
              "{study.testimonial.text}"
            </blockquote>
            {study.testimonial.author && (
              <p className="mt-6 text-sm text-muted">
                — <span className="font-bold text-text">{study.testimonial.author}</span>
                {study.testimonial.role && `, ${study.testimonial.role}`}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-24 border-t border-white/5 relative">
        <div className="container-shell text-center">
          <ScrollReveal>
            <div className="hero-glass glass-noise p-12 rounded-3xl border border-white/5 max-w-3xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#34d99a]/10 rounded-full blur-[80px]" />
              <h3 className="text-2xl font-display font-bold text-white mb-4 relative z-10">
                Want results like these for your project?
              </h3>
              <p className="text-[#8b8fa3] mb-8 relative z-10">
                Share your idea and we'll provide a clear roadmap within 24 hours.
              </p>
              <div className="flex flex-wrap gap-4 justify-center relative z-10">
                <Link to="/contact" className="cta-btn">
                  Start Your Project <ArrowRight size={16} className="ml-2" />
                </Link>
                <Link to="/booking" className="outline-btn">
                  Book a Strategy Call
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
