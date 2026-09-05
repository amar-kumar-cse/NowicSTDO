import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import NotFound from './NotFound';
import { ArrowRight, BookOpen, Calendar } from 'lucide-react';
import RelatedServices from '../components/common/RelatedServices';
import { api, resolveImageUrl } from '../lib/api';
import { services as mockServices } from '../lib/services-data';
import { ServicePageClient } from '../components/sections/ServicePageClient';
import ScrollReveal from '../components/reveal/ScrollReveal';
import SectionHeading from '../components/common/SectionHeading';
import { PricingSection } from '../components/sections/PricingSection';
import { servicePricing } from '../data/pricingData';
import { serviceDetails } from '../data/serviceDetails';

const SERVICE_BLOG_MAPPING = {
  'mvp-development': ['mvp-development-cost-india-2025'],
  'ai-web-apps': ['ai-assisted-development-code-review'],
};

export default function ServiceDetail() {
  const { slug } = useParams();
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    const mappedBlogSlugs = SERVICE_BLOG_MAPPING[slug] || [];
    if (mappedBlogSlugs.length > 0) {
      api.public_getBlogs().then(res => {
        if (res.success) {
          const matched = (res.data || []).filter(post => mappedBlogSlugs.includes(post.slug));
          setRelatedBlogs(matched);
        }
      }).catch(() => {});
    } else {
      setRelatedBlogs([]);
    }
  }, [slug]);

  const { content } = useContent();
  const pricingData = content?.pricingData || {};
  const currentServicePricing = pricingData?.servicePricing || servicePricing;
  
  // Use the new architecture data from backend if available, fallback to serviceDetails or mockServices
  const dynamicServices = content?.services || [];
  let service = dynamicServices.find(s => s.slug === slug);
  if (!service) {
    service = serviceDetails[slug];
  }
  if (!service) {
    service = mockServices.find(s => s.slug === slug);
  }

  if (!service) {
    return <NotFound />;
  }

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": service.title,
      "description": service.description,
      "provider": {
        "@type": "Organization",
        "name": "Nowic Studio",
        "url": "https://www.nowicstdio.tech"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.nowicstdio.tech/" },
        { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://www.nowicstdio.tech/services" },
        { "@type": "ListItem", "position": 3, "name": service.title, "item": `https://www.nowicstdio.tech/services/${slug}` }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": (service.faqs || []).map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": { "@type": "Answer", "text": faq.a }
      }))
    }
  ];

  return (
    <>
      <SEO 
        title={`${service.title} Services | Nowic Studio`}
        description={service.description}
        canonicalUrl={`https://www.nowicstdio.tech/services/${slug}`}
        keywords={`${service.title.toLowerCase()} services, software development, Nowic Studio`}
        schema={schema}
      />
      
      <div className="absolute top-24 left-0 w-full z-50 pointer-events-none">
        <div className="container-shell pointer-events-auto">
          <Breadcrumbs items={[
            { label: 'Services', path: '/services' },
            { label: service.title, path: `/services/${slug}` }
          ]} />
        </div>
      </div>

      <ServicePageClient service={service} />

      <PricingSection pricing={currentServicePricing[slug] || currentServicePricing['default']} />

      {/* Keep existing Related Resources (Blog) logic below the new UI */}
      {relatedBlogs.length > 0 && (
        <section className="py-24 relative overflow-hidden bg-[#050806]">
          <div className="container-shell">
            <SectionHeading
              eyebrow="Resources"
              title="Related |Insights"
              description="Deep dives and guides related to this service."
            />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {relatedBlogs.map((post, i) => (
                <ScrollReveal key={post.slug} delay={i * 0.07}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group flex flex-col h-full rounded-2xl bg-white/[0.02] border border-white/5 hover:border-mint/20 hover:bg-white/[0.04] overflow-hidden transition-all"
                  >
                    <div className="h-40 w-full overflow-hidden bg-surface/30 border-b border-white/5">
                      {post.cover_image_url ? (
                        <img src={resolveImageUrl(post.cover_image_url)} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#3a3e50]">
                          <BookOpen size={32} />
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1 gap-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted">
                        <Calendar size={10} />
                        {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                      <h3 className="font-display text-base font-bold text-text group-hover:text-mint transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="mt-auto pt-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-mint hover:text-white transition-colors">
                        Read Article <ArrowRight size={12} />
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Keep Related Services */}
      <RelatedServices currentServiceSlug={slug} />
    </>
  );
}
