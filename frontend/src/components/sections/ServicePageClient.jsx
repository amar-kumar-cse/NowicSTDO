import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { cn } from '../../lib/utils';
import { Code, Smartphone, Megaphone, CheckCircle2, Cpu, Globe, Rocket, Building2, LayoutDashboard, Layers, Sparkles, Code2, Zap, Trophy, Users, Star, Clock, Check, ShieldCheck, Gauge, Bot } from 'lucide-react';
import { resolveImageUrl } from '../../lib/api';

const ICONS = {
  Code, Smartphone, Megaphone, Cpu, Globe, Rocket, Building2,
  LayoutDashboard, Layers, Sparkles, Code2, Zap, Trophy, Users,
  Star, Clock, Check, ShieldCheck, Gauge, Bot
};

function getIcon(name) {
  const Icon = ICONS[name];
  return Icon ? <Icon size={24} /> : <CheckCircle2 size={24} />;
}

function renderSplitColorTitle(title) {
  if (!title) return null;
  const words = title.split(' ');
  const half = Math.ceil(words.length / 2);
  const firstPart = words.slice(0, half).join(' ');
  const secondPart = words.slice(half).join(' ');
  
  return (
    <>
      <span className="text-white">{firstPart}</span>{' '}
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#34d99a] to-emerald-400">
        {secondPart}
      </span>
    </>
  );
}

export function ServicePageClient({ service }) {
  const { ref: heroRef, isVisible: isHeroVisible } = useScrollAnimation();
  const { ref: introRef, isVisible: isIntroVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: detailsRef, isVisible: isDetailsVisible } = useScrollAnimation({ threshold: 0.05 });
  const { ref: processRef, isVisible: isProcessVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: wcuRef, isVisible: isWcuVisible } = useScrollAnimation({ threshold: 0.1 });

  const hero = service.heroContent || {};

  return (
    <div className="w-full bg-[#050806] min-h-screen text-white pt-24">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden transition-all duration-1000 border-b border-white/5 pb-16"
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#050806]/80 z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050806]/50 to-[#050806] z-10" />
          {hero.image?.src ? (
             <img 
               src={hero.image.src} 
               alt={hero.image.alt || "Hero"}
               className="w-full h-full object-cover filter blur-sm scale-105 opacity-40"
             />
          ) : (
             <div className="absolute inset-0 bg-gradient-to-b from-[#34d99a]/10 to-transparent opacity-20" />
          )}
        </div>

        <div className={cn(
          "relative z-20 container-shell text-center flex flex-col items-center justify-center transition-all duration-1000 transform",
          isHeroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#34d99a]/10 filter blur-[120px] rounded-full animate-pulse pointer-events-none" />

          <p className="eyebrow mb-6 text-[#34d99a] bg-[#34d99a]/10 px-4 py-1.5 rounded-full inline-block font-medium border border-[#34d99a]/20">
            {hero.subtitle || service.headline || service.title}
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold mb-6 tracking-tight max-w-5xl leading-tight">
            {renderSplitColorTitle(hero.title || service.title)}
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8 font-light leading-relaxed">
            {hero.description || service.description}
          </p>
        </div>
      </section>

      {/* Introduction */}
      {service.introduction && (
        <section ref={introRef} className="py-16 md:py-24 relative z-10 -mt-10">
          <div className="container-shell">
            <div className={cn(
              "max-w-4xl mx-auto text-center p-8 md:p-12 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl transition-all duration-700",
              isIntroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              <QuoteIcon className="w-10 h-10 text-[#34d99a]/40 mx-auto mb-6" />
              <p className="text-xl md:text-2xl font-light text-gray-300 leading-relaxed italic">
                {service.introduction}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Sub-Services Details */}
      {service.subServices && service.subServices.length > 0 && (
        <section ref={detailsRef} className="py-24 relative overflow-hidden bg-neutral-950 border-t border-white/5">
          <div className="container-shell">
            <div className={cn(
              "text-center max-w-3xl mx-auto mb-16 transition-all duration-700 transform",
              isDetailsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Our Core <span className="text-[#34d99a]">Capabilities</span></h2>
              <p className="text-gray-400 text-lg">Detailed breakdown of what we offer within this service domain.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.subServices.map((sub, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:border-[#34d99a]/30 hover:bg-white/[0.04] transition-all group">
                  <div className="h-14 w-14 rounded-2xl bg-[#34d99a]/10 text-[#34d99a] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#34d99a] group-hover:text-black transition-all">
                    {getIcon(sub.icon)}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{sub.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-6 h-20 overflow-hidden">{sub.description}</p>
                  
                  {sub.features && sub.features.length > 0 && (
                    <ul className="space-y-3 pt-6 border-t border-white/5">
                      {sub.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                          <CheckCircle2 size={16} className="text-[#34d99a] shrink-0 mt-0.5" /> 
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process Section */}
      {service.process && service.process.length > 0 && (
        <section ref={processRef} className="py-24 relative bg-[#0a0b0f] border-t border-white/5 overflow-hidden">
          <div className="container-shell">
            <div className={cn(
              "text-center max-w-3xl mx-auto mb-20 transition-all duration-700 transform",
              isProcessVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">How We <span className="text-[#34d99a]">Deliver</span></h2>
              <p className="text-gray-400 text-lg">Our proven, agile methodology ensures transparent and seamless execution.</p>
            </div>

            <div className="relative">
              <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#34d99a]/0 via-[#34d99a]/30 to-[#34d99a]/0 md:-translate-x-1/2 hidden md:block" />
              
              <div className="space-y-12 md:space-y-0 relative">
                {service.process.map((step, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <div key={idx} className={cn(
                      "relative flex flex-col md:flex-row items-center gap-8 md:gap-16",
                      !isEven ? "md:flex-row-reverse" : ""
                    )}>
                      {/* Timeline Dot */}
                      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#0a0b0f] border-2 border-[#34d99a] items-center justify-center font-bold text-[#34d99a] z-10 shadow-[0_0_20px_rgba(52,217,154,0.2)]">
                        {step.step}
                      </div>

                      <div className={cn(
                        "w-full md:w-1/2",
                        isEven ? "md:text-right md:pr-16" : "md:text-left md:pl-16"
                      )}>
                        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:border-[#34d99a]/30 transition-all">
                          <span className="text-[#34d99a] font-black text-xl mb-2 block md:hidden">Step {step.step}</span>
                          <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                          <p className="text-gray-400 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                      
                      <div className="hidden md:block w-1/2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      {service.whyChooseUs && service.whyChooseUs.length > 0 && (
        <section ref={wcuRef} className="py-24 relative bg-neutral-950 border-t border-white/5">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px]" />
          <div className="container-shell relative z-10">
            <div className={cn(
              "text-center max-w-3xl mx-auto mb-16 transition-all duration-700 transform",
              isWcuVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Why Partner <span className="text-[#34d99a]">With Us</span></h2>
              <p className="text-gray-400 text-lg">We bring expertise, agility, and innovation to every project we undertake.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {service.whyChooseUs.map((item, idx) => (
                <div key={idx} className="bg-black/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl text-center hover:border-white/10 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#34d99a]/20 to-emerald-900/40 text-[#34d99a] flex items-center justify-center mx-auto mb-6">
                    {getIcon(item.icon)}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* FAQ Section */}
      {service.faqs && service.faqs.length > 0 && (
        <section className="py-24 bg-[#0a0b0f] relative border-t border-white/5">
          <div className="container-shell max-w-3xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">Common Questions</h3>
            <div className="space-y-4">
              {service.faqs.map((faq, idx) => (
                <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors rounded-2xl">
                  <h4 className="text-lg font-bold text-white mb-3 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#34d99a]/10 text-[#34d99a] flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">Q</div>
                    {faq.q}
                  </h4>
                  <p className="text-gray-400 pl-9 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function QuoteIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.15-1.93.92-2.927.892-1.15 2.174-1.928 3.847-2.333l-.53-1.884c-2.457.653-4.322 1.8-5.594 3.442-1.346 1.737-1.745 3.593-1.196 5.567.24 1.14.764 2.115 1.573 2.924.81.808 1.785 1.332 2.924 1.573 1.974.549 3.83.15 5.568-1.196.48-.372.9-.804 1.258-1.295l-1.92-1.272c-.22.3-.477.568-.767.804-.84.693-1.767.927-2.775.7-.584-.132-1.096-.407-1.537-.824-.442-.416-.745-.928-.908-1.536-.07-.33-.095-.658-.075-.985zM22 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.15-1.93.92-2.927.892-1.15 2.174-1.928 3.847-2.333l-.53-1.884c-2.457.653-4.322 1.8-5.594 3.442-1.346 1.737-1.745 3.593-1.196 5.567.24 1.14.764 2.115 1.573 2.924.81.808 1.785 1.332 2.924 1.573 1.974.549 3.83.15 5.568-1.196.48-.372.9-.804 1.258-1.295l-1.92-1.272c-.22.3-.477.568-.767.804-.84.693-1.767.927-2.775.7-.584-.132-1.096-.407-1.537-.824-.442-.416-.745-.928-.908-1.536-.07-.33-.095-.658-.075-.985z" />
    </svg>
  );
}
