import { useEffect as usePrerenderEffect } from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useContent } from '../context/ContentContext';
import { api } from '../lib/api';
import { technologyDetails } from '../data/technologyDetails';

const techCategories = ['All', 'Frontend', 'Backend', 'Database', 'AI/ML', 'DevOps', 'Auth & Payments'];

export default function Technologies() {
  const [activeCategory, setActiveCategory] = useState('All');
  const { content, loading } = useContent();

  usePrerenderEffect(() => {
    if (!loading) {
      setTimeout(() => document.dispatchEvent(new Event('prerender-trigger')), 150);
    }
  }, [loading]);

  const [remoteTech, setRemoteTech] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.getSiteContentSection('technologies')
      .then(res => {
        if (!mounted) return;
        if (res && res.success && res.data && res.data.data) {
          setRemoteTech(res.data.data);
        }
      })
      .catch(() => {});
    return () => { mounted = false };
  }, []);

  const sourceTech = (remoteTech && Object.keys(remoteTech).length > 0)
    ? remoteTech
    : (content?.technologies && Object.keys(content.technologies).length > 0)
      ? content.technologies
      : technologyDetails;
  const allTech = Object.entries(sourceTech).map(([slug, tech]) => ({ slug, ...tech }));
  const filtered = activeCategory === 'All' ? allTech : allTech.filter(t => t.category === activeCategory);

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Technology Stack — Nowic Studio",
      "url": "https://www.nowicstdio.tech/technologies",
      "description": "Explore the technologies Nowic Studio uses to build premium software products."
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.nowicstdio.tech/" },
        { "@type": "ListItem", "position": 2, "name": "Technologies", "item": "https://www.nowicstdio.tech/technologies" }
      ]
    }
  ];

  return (
    <>
      <SEO
        title="Technology Stack — Tools We Use to Build Software | Nowic Studio"
        description="Explore the technologies Nowic Studio uses: React, Next.js, Django, Node.js, PostgreSQL, OpenAI, and more. Learn why we chose each tool and how we use them."
        canonicalUrl="https://www.nowicstdio.tech/technologies"
        keywords="software technology stack, react development, django development, nodejs development, openai integration, web development tools"
        schema={schema}
      />

      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#050806]" />
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#34d99a]/5 blur-[120px]" />

        <div className="container-shell relative z-10">
          <Breadcrumbs items={[{ label: 'Technologies', path: '/technologies' }]} />
          <SectionHeading
            as="h1"
            eyebrow="Our Stack"
            title="Technologies that |power| our products"
            description="We choose battle-tested, scalable tools — never hype-driven tech. Here's what we build with."
          />
        </div>
      </section>

      {/* Filters */}
      <section className="container-shell pb-6">
        <div className="flex flex-wrap justify-center gap-2">
          {techCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 ${activeCategory === cat
                ? 'bg-mint text-bg font-semibold'
                : 'bg-surface text-sub border border-subtle hover:text-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="container-shell pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((tech, i) => (
            <ScrollReveal key={tech.slug} delay={i * 0.03}>
              <Link
                to={`/technologies/${tech.slug}`}
                className="card p-5 h-full flex flex-col hover:border-mint/20 transition-all group"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-mint">{tech.category}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-text group-hover:text-mint transition-colors">{tech.name}</h3>
                <p className="mt-2 text-xs text-sub leading-relaxed flex-1">{tech.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-mint opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore {tech.name} <ArrowRight size={12} />
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  );
}
