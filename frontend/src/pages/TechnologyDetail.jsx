import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { api } from '../lib/api';
import SEO from '../components/SEO';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import Breadcrumbs from '../components/common/Breadcrumbs';
import NotFound from './NotFound';
import { CheckCircle2, ArrowRight, Layers } from 'lucide-react';
import { technologyDetails } from '../data/technologyDetails';

function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function TechnologyDetail() {
  const { slug } = useParams();
  const { content } = useContent();
  const [remoteTechMap, setRemoteTechMap] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.getSiteContentSection('technologies')
      .then(res => {
        if (!mounted) return;
        if (res && res.success && res.data && res.data.data) setRemoteTechMap(res.data.data || null);
      })
      .catch(() => {});
    return () => { mounted = false };
  }, []);

  const techMap = (remoteTechMap && Object.keys(remoteTechMap).length > 0)
    ? remoteTechMap
    : (content?.technologies && Object.keys(content.technologies).length > 0)
      ? content.technologies
      : technologyDetails;
  const tech = techMap[slug];
  const services = content?.services || [];

  if (!tech) return <NotFound />;

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": `${tech.name} Development — Nowic Studio`,
      "description": tech.description,
      "author": { "@type": "Organization", "name": "Nowic Studio", "url": "https://www.nowicstdio.tech" }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.nowicstdio.tech/" },
        { "@type": "ListItem", "position": 2, "name": "Technologies", "item": "https://www.nowicstdio.tech/technologies" },
        { "@type": "ListItem", "position": 3, "name": tech.name, "item": `https://www.nowicstdio.tech/technologies/${slug}` }
      ]
    }
  ];

  return (
    <>
      <SEO
        title={`${tech.name} Development Services | Nowic Studio`}
        description={tech.description}
        canonicalUrl={`https://www.nowicstdio.tech/technologies/${slug}`}
        keywords={`${tech.name.toLowerCase()} development, ${tech.name.toLowerCase()} developer, ${tech.category.toLowerCase()} development, Nowic Studio`}
        schema={schema}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#050806]" />
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#34d99a]/5 blur-[120px]" />

        <div className="container-shell relative z-10">
          <Breadcrumbs items={[
            { label: 'Technologies', path: '/technologies' },
            { label: tech.name, path: `/technologies/${slug}` }
          ]} />

          <div className="max-w-4xl mx-auto mt-12">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#34d99a] bg-[#34d99a]/10 border border-[#34d99a]/20 px-3 py-1 rounded-full">
              {tech.category}
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold text-[#f0f0f3] leading-tight sm:text-5xl">
              {tech.name}
            </h1>
            <p className="mt-4 text-xl text-[#8b8fa3] leading-relaxed">{tech.tagline}</p>
            <p className="mt-6 text-base text-[#8b8fa3] leading-relaxed max-w-3xl">{tech.description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact" className="cta-btn">
                Start a {tech.name} Project <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link to="/booking" className="outline-btn">Book a Call</Link>
            </div>
          </div>
        </div>
      </section>

      {/* What we use it for */}
      <section className="py-24 border-t border-white/5 bg-[#0a0b0f]">
        <div className="container-shell">
          <SectionHeading eyebrow="Use Cases" title={`What we use |${tech.name}| for`} />
          <div className="mt-12 flex flex-wrap gap-3 justify-center">
            {tech.usedFor.map((use, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <span className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-sm text-[#cbd5e1] font-medium">
                  <CheckCircle2 size={14} className="text-[#34d99a]" /> {use}
                </span>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why we use it */}
      <section className="py-24 border-t border-white/5">
        <div className="container-shell max-w-4xl mx-auto">
          <SectionHeading eyebrow="Why This Tool" title={`Why we choose |${tech.name}`} />
          <div className="mt-12 space-y-4">
            {tech.whyWeUseIt.map((reason, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#34d99a]/10 text-xs font-bold text-[#34d99a]">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[#cbd5e1] leading-relaxed">{reason}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Related Services */}
      {tech.relatedServices && tech.relatedServices.length > 0 && (
        <section className="py-24 border-t border-white/5 bg-[#0a0b0f]">
          <div className="container-shell">
            <SectionHeading eyebrow="Services" title={`Services using |${tech.name}`} />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tech.relatedServices.map((serviceSlug, i) => {
                const service = services.find(s => toSlug(s.title) === serviceSlug || s.slug === serviceSlug);
                if (!service) return null;
                return (
                  <ScrollReveal key={serviceSlug} delay={i * 0.05}>
                    <Link to={`/services/${serviceSlug}`} className="card p-5 h-full flex flex-col hover:border-mint/20 transition-all group">
                      <h3 className="font-display text-base font-bold text-text group-hover:text-mint transition-colors">{service.title || service.name}</h3>
                      <p className="mt-2 text-xs text-sub leading-relaxed flex-1 line-clamp-2">{service.description}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-mint">
                        Explore {service.title || service.name} <ArrowRight size={12} />
                      </span>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Related Technologies */}
      {tech.relatedTech && tech.relatedTech.length > 0 && (
        <section className="py-24 border-t border-white/5">
          <div className="container-shell">
            <SectionHeading eyebrow="Related" title="Technologies we pair |with this" />
            <div className="mt-12 flex flex-wrap gap-3 justify-center">
              {tech.relatedTech.map(relSlug => {
                const rel = techMap[relSlug];
                if (!rel) return null;
                return (
                  <Link
                    key={relSlug}
                    to={`/technologies/${relSlug}`}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-sm text-text font-medium hover:border-mint/20 hover:text-mint transition-all"
                  >
                    <Layers size={14} className="text-mint" /> {rel.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 border-t border-white/5 bg-[#0a0b0f]">
        <div className="container-shell text-center">
          <ScrollReveal>
            <div className="hero-glass glass-noise p-12 rounded-3xl border border-white/5 max-w-3xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#34d99a]/10 rounded-full blur-[80px]" />
              <h3 className="text-2xl font-display font-bold text-white mb-4 relative z-10">
                Ready to build with {tech.name}?
              </h3>
              <p className="text-[#8b8fa3] mb-8 relative z-10">
                Let's discuss how {tech.name} fits into your project architecture.
              </p>
              <div className="flex flex-wrap gap-4 justify-center relative z-10">
                <Link to="/contact" className="cta-btn">Start Your Project <ArrowRight size={16} className="ml-2" /></Link>
                <Link to="/booking" className="outline-btn">Book a Strategy Call</Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
