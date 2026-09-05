import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from '../reveal/ScrollReveal';

export default function CTASection({ 
  title = "Ready to build something incredible?", 
  description = "Share your idea and we'll provide a clear roadmap within 24 hours.",
  primaryButtonText = "Start Your Project",
  primaryButtonLink = "/contact",
  secondaryButtonText = "Book a Strategy Call",
  secondaryButtonLink = "/booking"
}) {
  return (
    <section className="py-24 border-t border-white/5 relative bg-[#0a0b0f]">
      <div className="container-shell text-center">
        <ScrollReveal>
          <div className="hero-glass glass-noise p-12 rounded-3xl border border-white/5 max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#34d99a]/10 rounded-full blur-[80px]" />
            <h3 className="text-2xl font-display font-bold text-white mb-4 relative z-10">
              {title}
            </h3>
            <p className="text-[#8b8fa3] mb-8 relative z-10">
              {description}
            </p>
            <div className="flex flex-wrap gap-4 justify-center relative z-10">
              <Link to={primaryButtonLink} className="cta-btn">
                {primaryButtonText} <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link to={secondaryButtonLink} className="outline-btn">
                {secondaryButtonText}
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
