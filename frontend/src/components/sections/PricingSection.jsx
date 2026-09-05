import { Link } from 'react-router-dom';
import { Check, Sparkles, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import ScrollReveal from '../reveal/ScrollReveal';

export function PricingSection({ pricing }) {
  if (!pricing || pricing.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-24 bg-[#050806] border-t border-white/5">
      {/* Background Effects */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[450px] w-[700px] rounded-full bg-[#34d99a]/5 blur-[130px]" />
      
      <div className="container-shell relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="eyebrow">Pricing & Packages</p>
          <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
            Clear, outcome-based <span className="text-gradient">investment</span>
          </h2>
          <p className="mt-4 text-sm text-[#8b8fa3]">
            No hidden fees or unexpected billing. Milestone-based delivery with guaranteed post-launch warranty and full code ownership.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto items-stretch">
          {pricing.map((tier) => (
            <ScrollReveal key={tier.name} delay={tier.delay || 0.1}>
              <div className={`relative h-full rounded-3xl bg-[#0e0f14]/90 backdrop-blur-md border ${tier.popular ? 'border-[#34d99a] shadow-[0_0_40px_rgba(52,217,154,0.12)]' : 'border-white/10'} p-8 flex flex-col justify-between transition-all duration-300 hover:border-white/20`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#34d99a] to-[#2cb380] text-[#050806] text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Sparkles size={12} /> Most Popular
                  </div>
                )}

                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-display font-bold text-white mb-2">{tier.name}</h3>
                    <p className="text-sm text-[#8b8fa3] min-h-[40px]">{tier.description}</p>
                  </div>

                  <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-[#8b8fa3] uppercase tracking-wider">From</span>
                      <span className="text-3xl sm:text-4xl font-display font-bold text-white">{tier.price}</span>
                    </div>
                    {tier.retainer && (
                      <p className="text-xs text-[#34d99a] mt-1 font-medium">
                        Optional Retainer: {tier.retainer}
                      </p>
                    )}
                  </div>

                  {/* Delivery & Warranty Badges */}
                  {(tier.deliveryTime || tier.warranty) && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {tier.deliveryTime && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#cbd5e1]">
                          <Clock size={13} className="text-[#34d99a]" />
                          <span>{tier.deliveryTime}</span>
                        </div>
                      )}
                      {tier.warranty && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34d99a]/10 border border-[#34d99a]/20 text-xs font-medium text-[#34d99a]">
                          <ShieldCheck size={13} />
                          <span>{tier.warranty}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-6">
                    <p className="text-[10px] font-semibold text-[#8b8fa3] uppercase tracking-wider mb-2 border-b border-white/10 pb-1">Ideal For</p>
                    <p className="text-xs text-[#cbd5e1] font-medium">{tier.idealFor}</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    <p className="text-[10px] font-semibold text-[#8b8fa3] uppercase tracking-wider mb-2 border-b border-white/10 pb-1">What's Included</p>
                    {tier.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Check size={15} className="text-[#34d99a] shrink-0 mt-0.5" />
                        <span className="text-xs text-[#cbd5e1] leading-relaxed">{feature}</span>
                      </div>
                    ))}

                    {tier.notIncluded && tier.notIncluded.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-white/5 space-y-3">
                        {tier.notIncluded.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2.5 opacity-40">
                            <div className="w-3.5 h-3.5 rounded-full border border-[#8b8fa3] flex items-center justify-center shrink-0 mt-0.5">
                              <span className="w-1 h-1 rounded-full bg-[#8b8fa3]" />
                            </div>
                            <span className="text-xs text-[#8b8fa3] line-through leading-relaxed">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Link 
                  to="/booking" 
                  className={`w-full py-4 rounded-xl text-center text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                    tier.popular 
                      ? 'bg-[#34d99a] text-[#050806] hover:bg-white hover:shadow-[0_0_25px_rgba(52,217,154,0.3)]' 
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
  );
}

