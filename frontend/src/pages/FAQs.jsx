import { useEffect as usePrerenderEffect } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import Breadcrumbs from '../components/common/Breadcrumbs';

const FAQ_SECTIONS = [
  {
    title: 'General',
    faqs: [
      { q: 'What does Nowic Studio do?', a: 'We are a premium software development agency that builds MVPs, SaaS platforms, AI web apps, business websites, admin dashboards, and backend APIs for startups and businesses worldwide.' },
      { q: 'Where is Nowic Studio based?', a: 'We are based in India and work with clients globally, including the US, UK, UAE, and across Asia.' },
      { q: 'Do you work with remote clients?', a: 'Yes, 100%. We work with clients across time zones using async communication, weekly demos, and direct founder access.' },
    ]
  },
  {
    title: 'Services & Process',
    faqs: [
      { q: 'What services do you offer?', a: 'We offer 6 core services: MVP Development, Business Websites, AI Web Apps, Admin Dashboards, SaaS Platforms, and API & Backend Development.' },
      { q: 'How long does a typical project take?', a: 'Business websites: 1-2 weeks. MVPs: 2-4 weeks. SaaS platforms: 4-8 weeks. Complex AI integrations: 2-3 weeks. Timelines depend on scope and complexity.' },
      { q: 'What is your development process?', a: 'We follow a 4-phase process: Discovery (understanding your needs) → Design (UI/UX and architecture) → Build (development in sprints) → Launch (deployment, testing, handover).' },
      { q: 'Do you provide post-launch support?', a: 'Yes. We offer ongoing maintenance packages, feature iterations, and dedicated support for all projects.' },
      { q: 'Can you work with an existing codebase?', a: 'Absolutely. We audit, refactor, and extend existing codebases with clean, maintainable enhancements.' },
    ]
  },
  {
    title: 'Pricing & Payments',
    faqs: [
      { q: 'How much does a project cost?', a: 'Starter websites from $1,499, MVPs from $2,499, AI integration from $3,999, SaaS platforms from $5,999. Custom quotes available for complex projects.' },
      { q: 'Do you offer payment plans?', a: 'Yes, projects are typically split into milestones: 50% upfront to commence work, and 50% upon final delivery and deployment.' },
      { q: 'Are there hidden costs?', a: 'No. The price we quote is what you pay for development. You only pay for your own hosting and third-party APIs (like OpenAI or Stripe) directly to those providers.' },
      { q: 'What payment methods do you accept?', a: 'We accept bank transfers, Stripe (international cards), and Razorpay (UPI, Indian cards). Invoices are issued for all payments.' },
    ]
  },
  {
    title: 'Technical',
    faqs: [
      { q: 'What tech stack do you use?', a: 'Frontend: React, Next.js, Vite, TypeScript, Tailwind CSS. Backend: Django, Django Ninja, Node.js, Express. Databases: PostgreSQL, MongoDB, Redis. AI: OpenAI, LangChain, Pinecone.' },
      { q: 'Do I own the source code?', a: 'Yes, 100%. Upon final payment, all intellectual property and full source code are transferred to you.' },
      { q: 'How do you handle security?', a: 'We implement industry-standard security: HTTPS, CSRF protection, input validation, parameterized queries, authentication via Clerk or custom JWT, and environment-based secret management.' },
      { q: 'Can you integrate AI into my existing app?', a: 'Yes. We can build custom APIs and microservices to add AI capabilities (chatbots, semantic search, content generation) to your current stack without rewriting it.' },
    ]
  },
  {
    title: 'Getting Started',
    faqs: [
      { q: 'How do I start a project?', a: 'Fill out our contact form or book a free strategy call. We\'ll discuss your idea, provide a roadmap, and give you a clear quote within 24 hours.' },
      { q: 'Do you offer free consultations?', a: 'Yes. We offer a free 15-30 minute discovery call where we discuss your project requirements, timeline, and budget.' },
      { q: 'What do I need to provide to get started?', a: 'A clear idea of what you want to build. We\'ll help refine the requirements, suggest the right tech stack, and create a detailed project plan.' },
    ]
  }
];

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <ScrollReveal delay={index * 0.03}>
      <div className="border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-start justify-between gap-4 p-5 text-left"
        >
          <div className="flex items-start gap-3">
            <HelpCircle size={18} className="text-[#34d99a] shrink-0 mt-0.5" />
            <h3 className="text-sm font-bold text-[#f0f0f3]">{faq.q}</h3>
          </div>
          <ChevronDown size={16} className={`shrink-0 text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="px-5 pb-5 pl-11">
            <p className="text-sm text-[#8b8fa3] leading-relaxed">{faq.a}</p>
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}

export default function FAQs() {
  const allFaqs = FAQ_SECTIONS.flatMap(s => s.faqs);

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": allFaqs.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": { "@type": "Answer", "text": faq.a }
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.nowicstdio.tech/" },
        { "@type": "ListItem", "position": 2, "name": "FAQs", "item": "https://www.nowicstdio.tech/faqs" }
      ]
    }
  ];

  return (
    <>
      <SEO
        title="Frequently Asked Questions — Software Development | Nowic Studio"
        description="Find answers to common questions about Nowic Studio's software development services, pricing, process, tech stack, and how to get started with your project."
        canonicalUrl="https://www.nowicstdio.tech/faqs"
        keywords="software development FAQ, MVP development questions, SaaS development cost, how much does software cost, software agency FAQ"
        schema={schema}
      />

      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#050806]" />
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#34d99a]/5 blur-[120px]" />

        <div className="container-shell relative z-10">
          <Breadcrumbs items={[{ label: 'FAQs', path: '/faqs' }]} />
          <SectionHeading
            as="h1"
            eyebrow="Help Center"
            title="Frequently Asked |Questions"
            description="Everything you need to know about working with Nowic Studio."
          />
        </div>
      </section>

      <section className="container-shell pb-24 max-w-4xl mx-auto">
        {FAQ_SECTIONS.map((section, si) => (
          <div key={section.title} className={si > 0 ? 'mt-16' : ''}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-mint mb-6 pl-1">{section.title}</h2>
            <div className="space-y-3">
              {section.faqs.map((faq, fi) => (
                <FAQItem key={fi} faq={faq} index={fi} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="container-shell text-center">
          <ScrollReveal>
            <div className="hero-glass glass-noise p-12 rounded-3xl border border-white/5 max-w-3xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#34d99a]/10 rounded-full blur-[80px]" />
              <h3 className="text-2xl font-display font-bold text-white mb-4 relative z-10">Still have questions?</h3>
              <p className="text-[#8b8fa3] mb-8 relative z-10">We'd love to hear from you. Get in touch and we'll respond within 24 hours.</p>
              <div className="flex flex-wrap gap-4 justify-center relative z-10">
                <Link to="/contact" className="cta-btn">Contact Us <ArrowRight size={16} className="ml-2" /></Link>
                <Link to="/booking" className="outline-btn">Book a Free Call</Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
