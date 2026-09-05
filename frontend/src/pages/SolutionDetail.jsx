import { useParams, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Target } from 'lucide-react';
import SEO from '../components/SEO';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import Breadcrumbs from '../components/common/Breadcrumbs';
import CTASection from '../components/common/CTASection';
import NotFound from './NotFound';
import { solutionDetails } from '../data/solutionDetails';
import { serviceDetails } from '../data/serviceDetails';

export default function SolutionDetail() {
  const { slug } = useParams();
  const solution = solutionDetails[slug];

  if (!solution) return <NotFound />;

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": `${solution.title} Solutions — Nowic Studio`,
      "description": solution.description,
      "author": { "@type": "Organization", "name": "Nowic Studio", "url": "https://www.nowicstdio.tech" }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.nowicstdio.tech/" },
        { "@type": "ListItem", "position": 2, "name": solution.title, "item": `https://www.nowicstdio.tech/solutions/${slug}` }
      ]
    }
  ];

  return (
    <>
      <SEO
        title={`${solution.title} Solutions | Nowic Studio`}
        description={solution.description}
        canonicalUrl={`https://www.nowicstdio.tech/solutions/${slug}`}
        keywords={`${solution.title.toLowerCase()}, software solutions, Nowic Studio solutions, custom software ${solution.title.toLowerCase()}`}
        schema={schema}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#050806]" />
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#34d99a]/5 blur-[120px]" />

        <div className="container-shell relative z-10">
          <Breadcrumbs items={[
            { label: 'Solutions', path: '/solutions' },
            { label: solution.title, path: `/solutions/${slug}` }
          ]} />

          <div className="max-w-4xl mx-auto mt-12 text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#34d99a] bg-[#34d99a]/10 border border-[#34d99a]/20 px-3 py-1 rounded-full">
              Use Case Solution
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold text-[#f0f0f3] leading-tight sm:text-5xl">
              {solution.title}
            </h1>
            <p className="mt-4 text-xl text-[#8b8fa3] leading-relaxed max-w-2xl mx-auto">{solution.tagline}</p>
            <p className="mt-6 text-base text-[#8b8fa3] leading-relaxed max-w-3xl mx-auto text-left">{solution.description}</p>
          </div>
        </div>
      </section>

      {/* The Problem & How We Solve It */}
      <section className="py-24 border-t border-white/5 bg-[#0a0b0f]">
        <div className="container-shell max-w-4xl mx-auto">
          {/* The Problem */}
          <ScrollReveal>
            <div className="mb-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-red-400 flex items-center gap-2 mb-4">
                <Target size={16} /> The Problem
              </h2>
              <p className="text-xl leading-relaxed text-[#f0f0f3] border-l-4 border-red-500/30 pl-6 py-2">
                {solution.problem}
              </p>
            </div>
          </ScrollReveal>

          {/* How we solve it */}
          <ScrollReveal delay={0.1}>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#34d99a] flex items-center gap-2 mb-6">
                <CheckCircle2 size={16} /> How Nowic Studio Solves It
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {solution.howWeSolveIt.map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-[#34d99a]/5 border border-[#34d99a]/10">
                    <span className="text-[#34d99a] text-lg font-bold mb-2 block">0{i + 1}</span>
                    <p className="text-sm text-[#cbd5e1] leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Related Services */}
      {solution.relatedServices && solution.relatedServices.length > 0 && (
        <section className="py-24 border-t border-white/5">
          <div className="container-shell">
            <SectionHeading eyebrow="Services" title={`How we deliver this |solution`} />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {solution.relatedServices.map((serviceSlug, i) => {
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
      {solution.relatedCaseStudies && solution.relatedCaseStudies.length > 0 && (
        <section className="py-24 border-t border-white/5 bg-[#0a0b0f]">
          <div className="container-shell">
            <SectionHeading eyebrow="Proof of Work" title={`Recent Work using this |solution`} />
            <div className="mt-12 flex flex-wrap gap-4 justify-center">
              {solution.relatedCaseStudies.map((caseSlug, i) => (
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
        title={`Ready to implement this solution?`}
        description="Book a free strategy call to discuss how we can solve this problem for your business."
      />
    </>
  );
}
