import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, Clock, BookOpen, ArrowRight, Search } from 'lucide-react';
import { api } from '../lib/api';
import SEO from '../components/SEO';
import SectionHeading from '../components/common/SectionHeading';
import ScrollReveal from '../components/reveal/ScrollReveal';
import Breadcrumbs from '../components/common/Breadcrumbs';

export default function Blog() {
    const [posts, setPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.public_getBlogs();
                if (response.success) {
                    setPosts(response.data || []);
                }
            } catch (err) {
                console.error('Failed to load blog posts:', err);
                setError('Failed to load blog posts. Please check back later.');
            } finally {
                setLoading(false);
                // Give React a moment to render the posts before snapping
                setTimeout(() => document.dispatchEvent(new Event('prerender-trigger')), 100);
            }
        };
        fetchPosts();
    }, []);

    const blogSchema = [
        {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Nowic Studio Blog",
            "description": "Expert insights on MVP development, SaaS architecture, web development, AI integration, and startup tech guides from Nowic Studio.",
            "url": "https://www.nowicstdio.tech/blog",
            "publisher": {
                "@type": "Organization",
                "name": "Nowic Studio",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.nowicstdio.tech/image.png"
                }
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.nowicstdio.tech/" },
                { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.nowicstdio.tech/blog" }
            ]
        }
    ];

    return (
        <div className="relative min-h-screen bg-bg selection:bg-mint/30">
            <SEO 
                title="Blog & Tech Insights — MVP, SaaS & AI Guides | Nowic Studio"
                description="Expert insights on building SaaS, MVP engineering, product design, AI application development, and startup tech strategy from the Nowic Studio team."
                canonicalUrl="https://www.nowicstdio.tech/blog"
                keywords="MVP development blog, SaaS architecture guide, AI integration tutorial, web development insights, startup tech blog, software engineering guides"
                schema={blogSchema}
            />

            {/* ── Background Elements ── */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div 
                    className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-mint/5 blur-[120px]"
                    style={{ animation: 'float 20s ease-in-out infinite' }}
                />
                <div 
                    className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[100px]"
                    style={{ animation: 'float-slow 25s ease-in-out infinite' }}
                />
                <div className="absolute inset-0 opacity-[0.02] dot-grid" />
            </div>

            {/* ── Header ── */}
            <section className="relative pt-32 pb-12 overflow-hidden z-10">
                <div className="container-shell relative">
                    <Breadcrumbs items={[{ label: 'Blog', path: '/blog' }]} />
                    <SectionHeading
                        as="h1"
                        eyebrow="Tech Insights"
                        title="Our |Thoughts| & |Guides|"
                        description="Practical guides, architecture deep-dives, and startup wisdom from engineers who build software daily."
                    />
                </div>
            </section>

            {/* ── Blog Search & Grid ── */}
            <section className="container-shell pb-32 z-10 relative">
                {!loading && !error && posts.length > 0 && (
                    <div className="max-w-md mx-auto mb-10 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search articles by title or keyword..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-text placeholder-muted focus:outline-none focus:border-mint/40 transition-colors"
                        />
                    </div>
                )}

                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="hero-glass p-5 border border-white/5 rounded-3xl space-y-4 animate-pulse">
                                <div className="h-48 w-full bg-white/5 rounded-2xl" />
                                <div className="h-4 w-2/3 bg-white/5 rounded" />
                                <div className="h-3 w-full bg-white/5 rounded" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-xs text-red-400 border border-dashed border-red-500/10 rounded-3xl bg-red-500/5 max-w-md mx-auto">
                        {error}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 text-sub flex flex-col items-center justify-center gap-3">
                        <BookOpen size={40} className="text-[#3c3e4f]" />
                        <p className="text-sm">No articles published yet. We are preparing our first guides!</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {posts.filter(p => {
                            const q = searchQuery.toLowerCase().trim();
                            if (!q) return true;
                            return (p.title || '').toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q);
                        }).map((post, idx) => (
                            <ScrollReveal key={post.id} delay={idx * 0.08}>
                                <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-5 hover:border-mint/30 transition-all">
                                    <Link to={`/blog/${post.slug}`} className="block overflow-hidden rounded-2xl aspect-[1.8/1] bg-[#16171e] relative mb-5">
                                        {post.cover_image_url ? (
                                            <img 
                                                src={post.cover_image_url} 
                                                alt={post.title} 
                                                loading="lazy"
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/image.png';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[#4a4e5e]">
                                                <BookOpen size={36} />
                                            </div>
                                        )}
                                    </Link>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="space-y-3">
                                            <h3 className="font-display text-lg font-bold text-text group-hover:text-mint transition-colors line-clamp-2">
                                                <Link to={`/blog/${post.slug}`}>
                                                    {post.title}
                                                </Link>
                                            </h3>
                                            <p className="text-xs leading-relaxed text-sub line-clamp-2">
                                                {post.excerpt || 'No summary available.'}
                                            </p>
                                        </div>

                                        <div className="space-y-4 pt-5">
                                            <div className="flex items-center justify-between text-[10px] text-muted border-t border-white/5 pt-4">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={10} /> {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Eye size={10} /> {post.views_count} Views
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={10} /> {post.read_time_minutes} min read
                                                </span>
                                            </div>

                                            <Link 
                                                to={`/blog/${post.slug}`}
                                                className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-mint hover:text-white transition-colors group-hover:translate-x-0.5"
                                            >
                                                Read Article <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            </ScrollReveal>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
