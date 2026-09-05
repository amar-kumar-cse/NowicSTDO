import { useEffect as usePrerenderEffect } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  Zap, 
  Shield, 
  HelpCircle, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Globe, 
  Smartphone, 
  Bot, 
  TrendingUp, 
  Palette, 
  Users, 
  CheckCircle2,
  Calendar,
  Rocket
} from 'lucide-react';
import SEO from '../components/SEO';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { servicePricing as staticServicePricing, generalTiers as staticGeneralTiers, deliveryLifecycle as staticDeliveryLifecycle } from '../data/pricingData';
import { useContent } from '../context/ContentContext';

const SERVICE_TABS = [
  { id: 'website-development', label: 'Website Dev', icon: Globe },
  { id: 'mobile-app-development', label: 'Mobile Apps', icon: Smartphone },
  { id: 'custom-software', label: 'SaaS & ERP', icon: Layers },
  { id: 'ai-services', label: 'AI & Automation', icon: Bot },
  { id: 'digital-marketing', label: 'SEO & Marketing', icon: TrendingUp },
  { id: 'graphics-designing', label: 'Branding & Design', icon: Palette },
  { id: 'resource-outsource', label: 'Staff Augmentation', icon: Users },
];

const FAQS = [
  {
    question: "How does the milestone-based payment model work?",
    answer: "For project-based tiers (like Growth Tier and individual packages), we typically split payments into structured milestones: 50% upfront to commence sprint architecture, and 50% upon final acceptance and production deployment."
  },
  {
    question: "What is included in the post-launch warranty support?",
    answer: "Our 90-day to 1-year warranty includes critical bug fixes, performance monitoring, browser/OS compatibility patches, and minor UI adjustments with guaranteed response turnaround."
  },
  {
    question: "Are there any hidden costs or recurring mandatory fees?",
    answer: "Zero hidden costs. Our development quote covers 100% of engineering and design deliverables. Third-party cloud infrastructure (like AWS, Vercel, OpenAI API tokens, or Apple/Google Developer Accounts) is billed directly to you at actuals."
  },
  {
    question: "Do I own 100% of the source code and IP?",
    answer: "Yes, 100%. Upon final project milestone clearance, all intellectual property, source code, Git repositories, Figma design assets, and database schemas are transferred directly to your organization."
  },
  {
    question: "Can we transition from a Growth Tier MVP to an Enterprise Tier SLA?",
    answer: "Absolutely. Once your MVP gains market traction, we seamlessly transition your platform to dedicated sprint cycles, custom SLA retainers, and multi-tenant cloud scaling."
  }
];

export default function Pricing() {
  const [activeTab, setActiveTab] = useState('website-development');
  const { content: cmsContent } = useContent() || {};
  const cmsPricingData = cmsContent?.pricingData;

  
  const servicePricing = cmsPricingData?.servicePricing || staticServicePricing;
  const generalTiers = cmsPricingData?.generalTiers || staticGeneralTiers;
  const deliveryLifecycle = cmsPricingData?.deliveryLifecycle || staticDeliveryLifecycle;

  usePrerenderEffect(() => {
    setTimeout(() => document.dispatchEvent(new Event('prerender-trigger')), 150);
  }, []);

  const activePricingPackages = servicePricing[activeTab] || servicePricing['default'] || [];

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "Nowic Studio",
      "url": "https://www.nowicstdio.tech/pricing",
      "description": "Transparent, milestone-based commercial pricing for Web Development, Mobile Apps, SaaS Platforms, AI Solutions, and Staff Augmentation.",
      "priceRange": "₹₹",
      "currenciesAccepted": "INR, USD",
      "areaServed": "Worldwide",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Software Engineering & Digital Agency Pricing",
        "itemListElement": generalTiers.map(tier => ({
          "@type": "Offer",
          "name": tier.name,
          "description": tier.description,
          "itemOffered": {
            "@type": "Service",
            "name": tier.name,
            "description": tier.description
          }
        }))
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.nowicstdio.tech/" },
        { "@type": "ListItem", "position": 2, "name": "Pricing", "item": "https://www.nowicstdio.tech/pricing" }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": FAQS.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
      }))
    }
  ];

  return (
    <>
      <SEO 
        title="Commercial Pricing & Engagement Tiers | Nowic Studio"
        description="Clear, transparent milestone-based pricing for Website Development, Mobile Apps, Custom SaaS ERPs, AI Agents, and Staff Augmentation. Growth and Enterprise Tiers with 100% code ownership."
        canonicalUrl="https://www.nowicstdio.tech/pricing"
        keywords="software development pricing, website development packages, mobile app MVP cost, SaaS platform pricing, AI agent development cost, SEO marketing packages, IT staff augmentation rates"
        schema={schema}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-[#050806]" />
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[550px] w-[850px] rounded-full bg-[#34d99a]/5 blur-[140px]" />
        <div className="engineering-grid" />

        <div className="container-shell relative z-10">
          <Breadcrumbs items={[{ label: 'Pricing', path: '/pricing' }]} />
          <div className="text-center max-w-3xl mx-auto">
            <p className="eyebrow">Commercial Pricing & Engagement</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold text-[#f0f0f3] leading-tight sm:text-5xl lg:text-6xl">
              Predictable pricing for <span className="text-gradient">high-velocity engineering</span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-[#8b8fa3] leading-relaxed">
              No hidden fees, no billing surprises. From lean founder MVPs to scalable enterprise cloud platforms, choose an engagement model engineered for outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Section 1: General Engagement Tiers (Growth vs Enterprise) */}
      <section className="pb-24 relative z-10">
        <div className="container-shell">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#34d99a]">Engagement Models</p>
            <h2 className="mt-2 text-3xl font-display font-bold text-white sm:text-4xl">
              Growth Tier vs. <span className="text-gradient">Enterprise Tier</span>
            </h2>
            <p className="mt-3 text-sm text-[#8b8fa3]">
              Choose the right engagement model based on project complexity, scope, and timeline requirements.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto items-stretch">
            {generalTiers.map((tier) => (
              <ScrollReveal key={tier.name} delay={0.1}>
                <div className={`relative h-full rounded-3xl bg-[#0e0f14]/90 backdrop-blur-md border ${tier.popular ? 'border-[#34d99a] shadow-[0_0_50px_rgba(52,217,154,0.15)] ring-1 ring-[#34d99a]/50' : 'border-white/10'} p-8 sm:p-10 flex flex-col justify-between`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#34d99a] to-[#2cb380] text-[#050806] text-[11px] font-black uppercase tracking-widest px-5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl">
                      <Sparkles size={13} /> Enterprise Grade
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#34d99a] bg-[#34d99a]/10 px-3 py-1 rounded-full border border-[#34d99a]/20">
                        {tier.badge}
                      </span>
                      <span className="text-xs text-[#8b8fa3] font-medium flex items-center gap-1.5">
                        <Clock size={13} className="text-[#34d99a]" /> {tier.timeline}
                      </span>
                    </div>

                    <h3 className="text-3xl font-display font-bold text-white mb-2">{tier.name}</h3>
                    <p className="text-sm text-[#8b8fa3] leading-relaxed mb-6">{tier.description}</p>

                    <div className="mb-6 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-display font-bold text-white">{tier.price}</span>
                      </div>
                      <p className="text-xs text-[#34d99a] mt-1.5 font-medium">{tier.retainer}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8 text-xs pb-6 border-b border-white/10">
                      <div>
                        <span className="text-[#8b8fa3] block uppercase tracking-wider text-[10px] font-semibold mb-1">Target Scope</span>
                        <span className="text-white font-medium">{tier.scope}</span>
                      </div>
                      <div>
                        <span className="text-[#8b8fa3] block uppercase tracking-wider text-[10px] font-semibold mb-1">Support & Warranty</span>
                        <span className="text-[#34d99a] font-medium">{tier.support}</span>
                      </div>
                    </div>

                    <div className="space-y-3.5 mb-10">
                      <p className="text-[11px] font-bold text-[#8b8fa3] uppercase tracking-wider">Key Deliverables Included</p>
                      {tier.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 size={16} className="text-[#34d99a] shrink-0 mt-0.5" />
                          <span className="text-xs text-[#cbd5e1] leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link 
                    to="/booking" 
                    className={`w-full py-4 rounded-xl text-center text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                      tier.popular 
                        ? 'bg-[#34d99a] text-[#050806] hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]' 
                        : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {tier.ctaText} <ArrowRight size={14} />
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Detailed Service-by-Service Pricing Packages */}
      <section className="py-24 bg-[#0a0b0f] border-y border-white/5 relative overflow-hidden">
        <div className="container-shell">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="eyebrow">Detailed Service Breakdown</p>
            <h2 className="mt-3 text-3xl font-display font-bold text-white sm:text-4xl">
              Concrete packages & <span className="text-gradient">exact deliverables</span>
            </h2>
            <p className="mt-4 text-sm text-[#8b8fa3]">
              Select a service category to review structured package scopes, delivery timelines, and feature inclusions.
            </p>
          </div>

          {/* Interactive Service Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto mb-14">
            {SERVICE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? 'bg-[#34d99a] text-[#050806] shadow-[0_0_20px_rgba(52,217,154,0.3)] font-bold'
                      : 'bg-white/5 text-[#8b8fa3] hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Package Cards for Active Tab */}
          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto items-stretch">
            {activePricingPackages.map((pkg, i) => (
              <ScrollReveal key={pkg.name} delay={i * 0.1}>
                <div className={`h-full rounded-3xl bg-[#0e0f14]/80 backdrop-blur-md border ${pkg.popular ? 'border-[#34d99a] shadow-[0_0_35px_rgba(52,217,154,0.1)]' : 'border-white/10'} p-8 flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      {pkg.popular && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#050806] bg-[#34d99a] px-3 py-1 rounded-full flex items-center gap-1">
                          <Sparkles size={11} /> Recommended
                        </span>
                      )}
                      <span className="text-xs text-[#8b8fa3] font-medium flex items-center gap-1.5 ml-auto">
                        <Clock size={13} className="text-[#34d99a]" /> {pkg.deliveryTime}
                      </span>
                    </div>

                    <h3 className="text-2xl font-display font-bold text-white mb-2">{pkg.name}</h3>
                    <p className="text-xs text-[#8b8fa3] min-h-[36px] mb-6 leading-relaxed">{pkg.description}</p>

                    <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-semibold text-[#8b8fa3] uppercase">From</span>
                        <span className="text-3xl font-display font-bold text-white">{pkg.price}</span>
                      </div>
                      {pkg.retainer && (
                        <p className="text-xs text-[#34d99a] mt-1 font-medium">
                          Retainer: {pkg.retainer}
                        </p>
                      )}
                    </div>

                    <div className="mb-6">
                      <p className="text-[10px] font-semibold text-[#8b8fa3] uppercase tracking-wider mb-2 border-b border-white/10 pb-1">Ideal For</p>
                      <p className="text-xs text-[#cbd5e1] font-medium">{pkg.idealFor}</p>
                    </div>

                    <div className="space-y-3 mb-8">
                      <p className="text-[10px] font-semibold text-[#8b8fa3] uppercase tracking-wider mb-2 border-b border-white/10 pb-1">Included Features</p>
                      {pkg.features.map((f, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <Check size={15} className="text-[#34d99a] shrink-0 mt-0.5" />
                          <span className="text-xs text-[#cbd5e1] leading-relaxed">{f}</span>
                        </div>
                      ))}

                      {pkg.notIncluded && pkg.notIncluded.length > 0 && (
                        <div className="pt-3 mt-3 border-t border-white/5 space-y-3">
                          {pkg.notIncluded.map((f, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 opacity-40">
                              <div className="w-3.5 h-3.5 rounded-full border border-[#8b8fa3] flex items-center justify-center shrink-0 mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-[#8b8fa3]" />
                              </div>
                              <span className="text-xs text-[#8b8fa3] line-through leading-relaxed">{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Link 
                    to="/booking" 
                    className={`w-full py-3.5 rounded-xl text-center text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                      pkg.popular 
                        ? 'bg-[#34d99a] text-[#050806] hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                        : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {pkg.ctaText} <ArrowRight size={14} />
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: 5-Step Agile Delivery Lifecycle */}
      <section className="py-24 relative overflow-hidden">
        <div className="container-shell">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="eyebrow">Execution Framework</p>
            <h2 className="mt-3 text-3xl font-display font-bold text-white sm:text-4xl">
              5-Step Agile <span className="text-gradient">Delivery Lifecycle</span>
            </h2>
            <p className="mt-4 text-sm text-[#8b8fa3]">
              From concept validation to zero-downtime launch, our battle-tested lifecycle ensures total transparency and on-time sprint releases.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5 max-w-6xl mx-auto">
            {deliveryLifecycle.map((stage, idx) => (
              <ScrollReveal key={stage.step} delay={idx * 0.08}>
                <div className="h-full rounded-2xl bg-white/[0.02] border border-white/5 p-6 flex flex-col justify-between hover:border-[#34d99a]/30 hover:bg-white/[0.04] transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-display text-2xl font-black text-[#34d99a] group-hover:scale-110 transition-transform">
                        {stage.step}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-[#8b8fa3]">
                        {stage.duration}
                      </span>
                    </div>

                    <p className="text-xs font-bold uppercase tracking-wider text-[#34d99a] mb-1">{stage.phase}</p>
                    <h4 className="text-base font-bold text-white mb-3">{stage.title}</h4>
                    <p className="text-xs text-[#8b8fa3] leading-relaxed mb-5">{stage.description}</p>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <p className="text-[10px] font-semibold text-[#8b8fa3] uppercase tracking-wider">Key Outputs</p>
                    {stage.deliverables.map((del, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2 text-[11px] text-[#cbd5e1]">
                        <Check size={12} className="text-[#34d99a] shrink-0 mt-0.5" />
                        <span>{del}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Guarantees */}
      <section className="py-20 border-y border-white/5 bg-[#0a0b0f]">
        <div className="container-shell">
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <ScrollReveal delay={0.1} className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#34d99a]/10 flex items-center justify-center mb-5 border border-[#34d99a]/20">
                <Shield className="text-[#34d99a]" size={24} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">100% Code & IP Ownership</h4>
              <p className="text-sm text-[#8b8fa3] leading-relaxed">You own all intellectual property, source code, and design tokens the moment final milestone clears.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.2} className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#34d99a]/10 flex items-center justify-center mb-5 border border-[#34d99a]/20">
                <Zap className="text-[#34d99a]" size={24} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Sprint-Based Rapid Execution</h4>
              <p className="text-sm text-[#8b8fa3] leading-relaxed">Modern frameworks, reusable component systems, and AI-accelerated dev sprints mean shipping in weeks.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.3} className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#34d99a]/10 flex items-center justify-center mb-5 border border-[#34d99a]/20">
                <ShieldCheck className="text-[#34d99a]" size={24} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Guaranteed Post-Launch Support</h4>
              <p className="text-sm text-[#8b8fa3] leading-relaxed">Every project comes with 30-day to 1-year warranty coverage so your live product remains rock solid.</p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Section 5: FAQs */}
      <section className="py-24 relative overflow-hidden">
        <div className="container-shell max-w-4xl mx-auto">
          <SectionHeading
            eyebrow="FAQ"
            title="Commercial & |contract terms"
            description="Everything you need to know about our engagement tiers, billing milestones, and warranties."
          />

          <div className="mt-16 space-y-4">
            {FAQS.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors">
                  <h4 className="text-lg font-bold text-[#f0f0f3] flex items-start gap-3">
                    <HelpCircle size={20} className="text-[#34d99a] shrink-0 mt-0.5" />
                    {faq.question}
                  </h4>
                  <p className="mt-4 text-[#8b8fa3] text-sm leading-relaxed pl-8">
                    {faq.answer}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Custom Quote CTA */}
      <section className="py-24 relative">
        <div className="container-shell text-center">
          <ScrollReveal>
            <div className="hero-glass glass-noise p-12 md:p-16 rounded-3xl border border-white/5 max-w-4xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#34d99a]/10 rounded-full blur-[100px]" />
              <p className="eyebrow relative z-10 text-[#34d99a]">Custom Requirements</p>
              <h3 className="text-3xl md:text-5xl font-display font-bold text-white mt-4 mb-4 relative z-10">
                Need a tailored enterprise platform?
              </h3>
              <p className="text-[#8b8fa3] max-w-xl mx-auto mb-8 relative z-10 text-sm md:text-base leading-relaxed">
                Multi-tenant cloud architectures, dedicated engineering pods, or high-security custom software. Let's engineer a solution for your exact requirements.
              </p>
              <Link to="/contact" className="cta-btn relative z-10 inline-flex items-center gap-2">
                Request a Custom Quote <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
