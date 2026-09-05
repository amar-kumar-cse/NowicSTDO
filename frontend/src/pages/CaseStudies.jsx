import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, Github, CheckCircle2, TrendingUp, Clock, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import SEO from '../components/SEO';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import InteractiveCard from '../components/ui/InteractiveCard';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { toProjectSlug } from '../data/caseStudyDetails';
import { BASE_URL } from '../lib/api';
import { useContent } from '../context/ContentContext';
import LoadingSpinner from '../components/LoadingSpinner';

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

// Fallback case studies if no portfolio data exists yet
const FALLBACK_CASES = [
  {
    id: 'cs-1',
    title: 'TheNahj — Islamic Wisdom Platform',
    category: 'SaaS Platform',
    description: 'A modern platform inspired by Imam Ali (AS), featuring quotes, reflections, focus tools, and an immersive reading experience with a powerful content management system.',
    tech_stack: ['React', 'Vite', 'Tailwind CSS', 'TypeScript', 'Node.js', 'Express'],
    live_url: 'https://thenahj.live',
    github_url: '',
    image_url: '',
    is_featured: true,
    problem: 'The client needed a premium digital platform to present classical Islamic wisdom to a modern, tech-savvy audience in an accessible and immersive way.',
    solution: 'We built a full-stack platform with a custom CMS, quote discovery engine, daily reflection feed, and a beautifully designed reading experience optimized for mobile.',
    results: ['Launched in 5 weeks', 'Zero downtime deployment', 'Fully CMS-driven content', 'Mobile-first premium UI']
  }
];

function CaseStudyCard({ project, index }) {
  const [expanded, setExpanded] = useState(false);
  const hasCaseStudy = project.problem || project.solution;

  return (
    <ScrollReveal delay={index * 0.07}>
      <InteractiveCard className="overflow-hidden p-0 h-full flex flex-col">
        {/* Cover image */}
        <div className="relative h-52 overflow-hidden bg-[#0c0e13] border-b border-white/5 shrink-0">
          {resolveImageUrl(project.image_url) ? (
            <img src={resolveImageUrl(project.image_url)} alt={project.title} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#34d99a]/5 via-transparent to-[#6366f1]/5 flex items-center justify-center">
              <Layers size={32} className="text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#34d99a] bg-[#34d99a]/10 border border-[#34d99a]/20 px-2.5 py-1 rounded-full">
              {project.category || 'Project'}
            </span>
            {project.is_featured && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-white/10 border border-white/10 px-2.5 py-1 rounded-full">
                ⭐ Featured
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-[#f0f0f3] leading-tight">{project.title}</h3>
          <p className="mt-2 text-sm text-[#8b8fa3] leading-relaxed line-clamp-3">{project.description}</p>

          {/* Tech tags */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {(project.tech_stack || []).slice(0, 5).map(tag => (
              <span key={tag} className="text-[10px] text-[#6b6f80] border border-white/5 bg-white/[0.02] px-2 py-0.5 rounded-full">{tag}</span>
            ))}
            {(project.tech_stack || []).length > 5 && (
              <span className="text-[10px] text-[#6b6f80] px-1 font-bold">+{project.tech_stack.length - 5}</span>
            )}
          </div>

          {/* Case study expand (if data exists) */}
          {hasCaseStudy && (
            <div className="mt-5 border-t border-white/5 pt-4">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-xs font-bold text-[#34d99a] uppercase tracking-widest hover:text-white transition-colors w-full"
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {expanded ? 'Hide' : 'Read'} Case Study
              </button>

              {expanded && (
                <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                  {project.problem && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b6f80] mb-1.5">🔍 The Problem</p>
                      <p className="text-xs text-[#94a3b8] leading-relaxed">{project.problem}</p>
                    </div>
                  )}
                  {project.solution && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b6f80] mb-1.5">💡 Our Solution</p>
                      <p className="text-xs text-[#94a3b8] leading-relaxed">{project.solution}</p>
                    </div>
                  )}
                  {project.results && project.results.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b6f80] mb-2">📈 Results</p>
                      <ul className="space-y-1.5">
                        {project.results.map((r, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-[#94a3b8]">
                            <CheckCircle2 size={11} className="text-[#34d99a] shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Links */}
          <div className="mt-auto pt-4 flex gap-3 border-t border-white/5 mt-5">
            <Link
              to={`/case-studies/${toProjectSlug(project.title)}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#34d99a] hover:text-white transition-colors"
            >
              Full Case Study <ArrowRight size={12} />
            </Link>
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8b8fa3] hover:text-white transition-colors ml-auto">
                <ExternalLink size={12} /> Live Demo
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8b8fa3] hover:text-white transition-colors">
                <Github size={12} /> GitHub
              </a>
            )}
          </div>
        </div>
      </InteractiveCard>
    </ScrollReveal>
  );
}

export default function CaseStudies() {
  const { content, loading } = useContent();
  const allProjects = content?.portfolioItems || content?.portfolio || [];
  const projects = Array.isArray(allProjects) && allProjects.length > 0
    ? [...allProjects].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
    : FALLBACK_CASES;

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Case Studies — Nowic Studio",
      "description": "Real projects, real results. Detailed breakdowns of products we've built for clients.",
      "url": "https://www.nowicstdio.tech/case-studies",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": projects.map((p, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "item": { "@type": "CreativeWork", "name": p.title, "description": p.description }
        }))
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.nowicstdio.tech/" },
        { "@type": "ListItem", "position": 2, "name": "Case Studies", "item": "https://www.nowicstdio.tech/case-studies" }
      ]
    }
  ];

  return (
    <>
      <SEO
        title="Case Studies | Nowic Studio"
        description="Real projects. Real results. Explore detailed case studies of MVPs, SaaS platforms, and AI products we've built for clients worldwide."
        canonicalUrl="https://www.nowicstdio.tech/case-studies"
        keywords="software case studies, MVP development case study, SaaS success stories, AI product case studies, software agency portfolio"
        schema={schema}
      />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-[#34d99a]/5 blur-[120px]" />
        <div className="engineering-grid" />

        <div className="container-shell relative z-10 text-center">
          <Breadcrumbs items={[{ label: 'Case Studies', path: '/case-studies' }]} />
          <p className="eyebrow">Our Work</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-[#f0f0f3] leading-tight sm:text-5xl">
            Products that prove <span className="text-gradient">our craft</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-[#8b8fa3] leading-relaxed">
            Every project is a story. From the problem and the solution — to the results clients got.
          </p>

          {/* Stats bar */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: TrendingUp, label: 'Projects Delivered', value: `${projects.length}+` },
              { icon: Clock, label: 'Avg. Delivery', value: '5 Weeks' },
              { icon: CheckCircle2, label: 'Uptime', value: '99.9%' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#34d99a]/10 border border-[#34d99a]/20 flex items-center justify-center">
                  <Icon size={14} className="text-[#34d99a]" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-extrabold text-[#f0f0f3] leading-none">{value}</p>
                  <p className="text-[10px] text-[#6b6f80] uppercase tracking-widest font-semibold">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-12 pb-24">
        <div className="container-shell">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner text="Loading case studies..." />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project, i) => (
                <CaseStudyCard key={project.id || project.title} project={project} index={i} />
              ))}
            </div>
          )}

          {/* CTA at bottom */}
          <ScrollReveal className="mt-16 text-center" delay={0.15}>
            <div className="hero-glass glass-noise p-10 rounded-2xl border border-white/5 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-[#f0f0f3]">Want your product to be here?</h3>
              <p className="mt-3 text-sm text-[#8b8fa3] leading-relaxed">
                We're currently accepting new projects. Share your idea and we'll get back to you within 24 hours.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Link to="/contact" className="cta-btn px-7 py-3">
                  Start a Project <ArrowRight size={14} className="ml-1.5" />
                </Link>
                <Link to="/booking" className="outline-btn">
                  Book a Call
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
