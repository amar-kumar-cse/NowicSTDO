import { useParams, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import Breadcrumbs from '../components/common/Breadcrumbs';
import CTASection from '../components/common/CTASection';
import NotFound from './NotFound';
import { industryDetails } from '../data/industryDetails';
import { serviceDetails } from '../data/serviceDetails';

export default function IndustryDetail() {
  const { slug } = useParams();
  const industry = industryDetails[slug];

  if (!industry) return <NotFound />;

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": `Software Development for ${industry.name} — Nowic Studio`,
      "description": industry.description,
      "author": { "@type": "Organization", "name": "Nowic Studio", "url": "https://www.nowicstdio.tech" }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.nowicstdio.tech/" },
        { "@type": "ListItem", "position": 2, "name": industry.name, "item": `https://www.nowicstdio.tech/industries/${slug}` }
      ]
    }
  ];

  return (
    <>
      <SEO
        title={`Software Development for ${industry.name} | Nowic Studio`}
        description={industry.description}
        canonicalUrl={`https://www.nowicstdio.tech/industries/${slug}`}
        keywords={`${industry.name.toLowerCase()} software development, custom software for ${industry.name.toLowerCase()}, ${industry.name.toLowerCase()} technology solutions`}
        schema={schema}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#050806]" />
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#34d99a]/5 blur-[120px]" />

        <div className="container-shell relative z-10">
          <Breadcrumbs items={[
            { label: industry.name, path: `/industries/${slug}` }
          ]} />

          <div className="max-w-4xl mx-auto mt-12 text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#34d99a] bg-[#34d99a]/10 border border-[#34d99a]/20 px-3 py-1 rounded-full">
              Industry Focus
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold text-[#f0f0f3] leading-tight sm:text-5xl">
              Software Development for <span className="text-gradient">{industry.name}</span>
            </h1>
            <p className="mt-4 text-xl text-[#8b8fa3] leading-relaxed max-w-2xl mx-auto">{industry.tagline}</p>
            <p className="mt-6 text-base text-[#8b8fa3] leading-relaxed max-w-3xl mx-auto text-left">{industry.description}</p>
          </div>
        </div>
      </section>

      {/* Challenges vs Solutions */}
      <section className="py-24 border-t border-white/5 bg-[#0a0b0f]">
        <div className="container-shell max-w-5xl mx-auto">
          <SectionHeading eyebrow="The Landscape" title="Challenges & |Solutions" />
          
          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {/* Challenges */}
            <ScrollReveal>
              <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10 h-full">
                <h3 className="text-xl font-display font-bold text-[#f0f0f3] mb-6 flex items-center gap-2">
                  <AlertCircle className="text-red-400" size={20} /> Industry Challenges
                </h3>
                <ul className="space-y-4">
                  {industry.challenges.map((challenge, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xs font-bold text-red-400 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-[#cbd5e1] leading-relaxed">{challenge}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* Solutions */}
            <ScrollReveal delay={0.1}>
              <div className="p-8 rounded-3xl bg-[#34d99a]/5 border border-[#34d99a]/10 h-full">
                <h3 className="text-xl font-display font-bold text-[#f0f0f3] mb-6 flex items-center gap-2">
                  <CheckCircle2 className="text-[#34d99a]" size={20} /> How We Solve Them
                </h3>
                <ul className="space-y-4">
                  {industry.solutions.map((solution, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="text-[#34d99a] shrink-0 mt-0.5" size={18} />
                      <p className="text-sm text-[#cbd5e1] leading-relaxed">{solution}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Related Services */}
      {industry.relatedServices && industry.relatedServices.length > 0 && (
        <section className="py-24 border-t border-white/5">
          <div className="container-shell">
            <SectionHeading eyebrow="Services" title={`How we help |${industry.name}`} />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {industry.relatedServices.map((serviceSlug, i) => {
                const service = serviceDetails[serviceSlug];
                if (!service) return null;
                return (
                  <ScrollReveal key={serviceSlug} delay={i * 0.05}>
                    <Link to={`/services/${serviceSlug}`} className="card p-5 h-full flex flex-col hover:border-mint/20 transition-all group">
                      <h3 className="font-display text-base font-bold text-text group-hover:text-mint transition-colors">{service.title}</h3>
                      <p className="mt-2 text-xs text-sub leading-relaxed flex-1 line-clamp-2">{service.description}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-mint">
                        Explore {service.title} <ArrowRight size={12} />
                      </span>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Related Case Studies */}
      {industry.relatedCaseStudies && industry.relatedCaseStudies.length > 0 && (
        <section className="py-24 border-t border-white/5 bg-[#0a0b0f]">
          <div className="container-shell">
            <SectionHeading eyebrow="Proof of Work" title={`Recent Work in |${industry.name}`} />
            <div className="mt-12 flex flex-wrap gap-4 justify-center">
              {industry.relatedCaseStudies.map((caseSlug, i) => (
                <ScrollReveal key={caseSlug} delay={i * 0.05}>
                  <Link to={`/case-studies/${caseSlug}`} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-sm text-text font-medium hover:border-mint/20 hover:text-mint transition-all">
                    View Project <ArrowRight size={14} className="ml-1" />
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection 
        title={`Ready to build your ${industry.name} product?`}
        description="Share your requirements and we'll provide a technical roadmap and proposal."
      />
    </>
  );
}
