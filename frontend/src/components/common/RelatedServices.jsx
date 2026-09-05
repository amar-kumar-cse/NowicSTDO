import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionHeading from './SectionHeading';
import ScrollReveal from '../reveal/ScrollReveal';
import { serviceDetails } from '../../data/serviceDetails';

export default function RelatedServices({ currentServiceSlug, limit = 3 }) {
  // Get all services except the current one
  const otherServices = Object.entries(serviceDetails)
    .filter(([slug]) => slug !== currentServiceSlug)
    .map(([slug, details]) => ({ slug, ...details }));

  // Take the first N (can be randomized in a real app, but deterministic is fine here)
  const related = otherServices.slice(0, limit);

  if (related.length === 0) return null;

  return (
    <section className="py-24 border-t border-white/5 bg-[#050806]">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Explore More"
          title="Related |Services"
          description="Other ways we can help you build and scale your business."
        />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {related.map((service, i) => {
            const Icon = service.icon;
            return (
              <ScrollReveal key={service.slug} delay={i * 0.1}>
                <div className="card p-6 h-full flex flex-col bg-white/[0.02] border border-white/5 hover:border-mint/20 transition-all group">
                  <div className="mb-4 h-12 w-12 rounded-xl bg-mint/10 flex items-center justify-center text-mint">
                    {Icon && <Icon size={24} />}
                  </div>
                  <h3 className="font-display text-lg font-bold text-text group-hover:text-mint transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm text-sub leading-relaxed flex-1 line-clamp-3">
                    {service.description}
                  </p>
                  <Link
                    to={`/services/${service.slug}`}
                    className="mt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-mint opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View Details <ArrowRight size={12} />
                  </Link>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
