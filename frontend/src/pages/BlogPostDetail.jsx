import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Eye, Clock, ChevronLeft, BookOpen, Share2, Check, ArrowRight, AlertCircle } from 'lucide-react';
import { api, resolveImageUrl } from '../lib/api';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import MarkdownRenderer from '../components/common/MarkdownRenderer';

export default function BlogPostDetail() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [relatedPosts, setRelatedPosts] = useState([]);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const response = await api.public_getBlogDetail(slug);
                if (response.success) {
                    setPost(response.data);
                }
            } catch (err) {
                console.error('Failed to load blog post:', err);
                setError('Failed to load article. It might have been removed.');
            } finally {
                setLoading(false);
                // Give React a moment to render the post before snapping
                setTimeout(() => document.dispatchEvent(new Event('prerender-trigger')), 150);
            }
        };
        fetchPost();
    }, [slug]);

    useEffect(() => {
        api.public_getBlogs()
            .then(res => {
                if (res.success) {
                    const others = (res.data || [])
                        .filter(p => p.slug !== slug)
                        .slice(0, 2);
                    setRelatedPosts(others);
                }
            })
            .catch(() => {});
    }, [slug]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-bg">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-mint border-t-transparent" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center p-6 gap-4 z-10 relative">
                <AlertCircle size={48} className="text-red-400" />
                <h1 className="text-xl font-bold text-white">Post Not Found</h1>
                <p className="text-sm text-sub max-w-sm">{error || "This article doesn't exist."}</p>
                <Link to="/blog" className="outline-btn text-xs px-4 py-2 flex items-center gap-1">
                    <ChevronLeft size={14} /> Back to Blog
                </Link>
            </div>
        );
    }

    const postSchema = [
        {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "image": post.cover_image_url || "https://www.nowicstdio.tech/image.png",
            "datePublished": post.created_at,
            "dateModified": post.updated_at,
            "author": {
                "@type": "Organization",
                "name": "Nowic Studio Team",
                "url": "https://www.nowicstdio.tech"
            },
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
                { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.nowicstdio.tech/blog" },
                { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://www.nowicstdio.tech/blog/${post.slug}` }
            ]
        }
    ];

    return (
        <div className="relative min-h-screen bg-bg selection:bg-mint/30">
            <SEO 
                title={`${post.title} | Nowic Studio Blog`}
                description={post.excerpt}
                canonicalUrl={`https://www.nowicstdio.tech/blog/${post.slug}`}
                keywords={`${post.title.split(' ').join(', ')}, MVP development, software engineering, Nowic Studio`}
                schema={postSchema}
            />

            {/* ── Background Elements ── */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div 
                    className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-mint/5 blur-[120px]"
                />
                <div className="absolute inset-0 opacity-[0.02] dot-grid" />
            </div>

            {/* ── Content ── */}
            <article className="container-shell pt-32 pb-32 z-10 relative max-w-3xl">
                <Breadcrumbs items={[{ label: 'Blog', path: '/blog' }, { label: post.title, path: `/blog/${post.slug}` }]} />
                
                {/* Back button and Share */}
                <div className="flex items-center justify-between mb-8">
                    <Link 
                        to="/blog" 
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sub hover:text-white transition-colors"
                    >
                        <ChevronLeft size={14} /> Back to Blog
                    </Link>
                    <button 
                        onClick={handleShare}
                        className="inline-flex items-center gap-1.5 text-xs text-sub hover:text-white transition-colors rounded-xl border border-white/5 bg-white/[0.02] px-3 py-1.5"
                    >
                        {copied ? <><Check size={12} className="text-mint" /> Copied link</> : <><Share2 size={12} /> Share</>}
                    </button>
                </div>

                {/* Cover Image */}
                {post.cover_image_url && (
                    <div className="w-full rounded-3xl overflow-hidden border border-white/10 bg-[#16171e] mb-10 aspect-[2/1]">
                        <img 
                            src={resolveImageUrl(post.cover_image_url)} 
                            alt={post.title} 
                            loading="lazy"
                            className="h-full w-full object-cover" 
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/image.png';
                            }}
                        />
                    </div>
                )}

                {/* Article Header */}
                <div className="space-y-4 border-b border-white/10 pb-8 mb-10">
                    <h1 className="font-display text-3xl font-extrabold text-text sm:text-4xl md:text-5xl leading-tight tracking-tight">
                        {post.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                        <span className="flex items-center gap-1">
                            <Calendar size={12} /> {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Clock size={12} /> {post.read_time_minutes} min read
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Eye size={12} /> {post.views_count} Views
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-invert max-w-none text-[#b0b3c0]">
                    <MarkdownRenderer content={post.content} />
                </div>

                {/* Bottom CTA / Author footer */}
                <div className="border-t border-white/10 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-mint font-display font-black">
                            NS
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Written by Nowic Studio Team</p>
                            <p className="text-xs text-muted">Building premium software products & MVPs</p>
                        </div>
                    </div>
                    <Link to="/contact" className="cta-btn text-xs flex items-center gap-1">
                        Start Your Project <ArrowRight size={14} />
                    </Link>
                </div>

            </article>
            
            {/* ── Related Articles ── */}
            {relatedPosts.length > 0 && (
                <section className="container-shell max-w-3xl pb-24 z-10 relative">
                    <div className="border-t border-white/10 pt-12">
                        <h2 className="font-display text-xl font-bold text-text mb-6">
                            Related Articles
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {relatedPosts.map(post => (
                                <Link
                                    key={post.slug}
                                    to={`/blog/${post.slug}`}
                                    className="group flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-mint/20 hover:bg-white/[0.04] transition-all"
                                >
                                    {/* Thumbnail */}
                                    <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-white/5 border border-white/5">
                                        {post.cover_image_url ? (
                                            <img src={resolveImageUrl(post.cover_image_url)} alt={post.title} loading="lazy" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-[#3a3e50]">
                                                <BookOpen size={20} />
                                            </div>
                                        )}
                                    </div>
                                    {/* Text */}
                                    <div className="flex flex-col justify-center gap-1 min-w-0">
                                        <p className="text-sm font-bold text-text group-hover:text-mint transition-colors line-clamp-2 leading-snug">
                                            {post.title}
                                        </p>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-mint">
                                            Read <ArrowRight size={10} />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
