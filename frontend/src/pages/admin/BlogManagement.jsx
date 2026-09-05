import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, Edit, Trash2, Eye, Calendar, BookOpen,
    Globe, FileText, AlertCircle, TrendingUp, ChevronLeft,
    ChevronRight, Clock, RefreshCw, X, ExternalLink
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

// Debounce hook
function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

// Stat card
function StatCard({ icon: Icon, label, value, color, loading }) {
    return (
        <div className="stats-glass border border-white/5 rounded-xl p-4 flex items-center gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b6f80]">{label}</p>
                {loading ? (
                    <div className="mt-1 h-5 w-10 rounded bg-[#1e2028] animate-pulse" />
                ) : (
                    <p className="text-xl font-black text-[#f0f0f3]">{value ?? 0}</p>
                )}
            </div>
        </div>
    );
}

export default function BlogManagement() {
    const navigate = useNavigate();
    const { getApiToken } = useAuth();

    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('-created_at');
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [deletingId, setDeletingId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    const debouncedSearch = useDebounce(search, 400);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const token = await getApiToken();
            const res = await api.admin_getBlogStats(token);
            if (res.success) setStats(res.data);
        } catch { /* silently fail stats */ } finally {
            setStatsLoading(false);
        }
    }, [getApiToken]);

    // Fetch posts
    const fetchPosts = useCallback(async (currentPage = 1) => {
        setLoading(true);
        setError('');
        try {
            const token = await getApiToken();
            const params = {
                page: currentPage,
                page_size: 9,
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(statusFilter && { status: statusFilter }),
            };
            const response = await api.admin_getBlogs(token, params);
            if (response.success) {
                setPosts(response.data || []);
                setPagination(response.pagination || null);
            }
        } catch (err) {
            setError('Failed to load blog posts. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [getApiToken, debouncedSearch, statusFilter]);

    const isFirstRender = useRef(true);
    const skipFetch = useRef(false);
    const prevSearch = useRef(debouncedSearch);
    const prevStatus = useRef(statusFilter);

    // SINGLE source of truth for fetching
    useEffect(() => {
        if (skipFetch.current) {
            skipFetch.current = false;
            return;
        }

        const filtersChanged = prevSearch.current !== debouncedSearch || prevStatus.current !== statusFilter;
        let targetPage = page;

        if (filtersChanged || isFirstRender.current) {
            if (filtersChanged) {
                targetPage = 1;
                prevSearch.current = debouncedSearch;
                prevStatus.current = statusFilter;
                
                if (page !== 1) {
                    skipFetch.current = true;
                    setPage(1);
                }
            }
            fetchStats();
            isFirstRender.current = false;
        }

        fetchPosts(targetPage);
    }, [page, debouncedSearch, statusFilter, fetchPosts]);

    const togglePublishStatus = async (post) => {
        setTogglingId(post.id);
        try {
            const token = await getApiToken();
            const response = await api.admin_updateBlog(token, post.id, {
                is_published: !post.is_published
            });
            if (response.success) {
                setPosts(prev => prev.map(p =>
                    p.id === post.id ? { ...p, is_published: response.data.is_published } : p
                ));
                fetchStats(); // refresh stat cards
            }
        } catch (err) {
            alert('Failed to update: ' + err.message);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (postId) => {
        if (!confirm('Permanently delete this article?')) return;
        setDeletingId(postId);
        try {
            const token = await getApiToken();
            const response = await api.admin_deleteBlog(token, postId);
            if (response.success) {
                setPosts(prev => prev.filter(p => p.id !== postId));
                fetchStats();
            }
        } catch (err) {
            alert('Delete failed: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const sortedPosts = [...posts].sort((a, b) => {
        if (sortBy === '-created_at') return new Date(b.created_at) - new Date(a.created_at);
        if (sortBy === 'created_at') return new Date(a.created_at) - new Date(b.created_at);
        if (sortBy === '-views_count') return (b.views_count || 0) - (a.views_count || 0);
        if (sortBy === '-read_time_minutes') return (b.read_time_minutes || 0) - (a.read_time_minutes || 0);
        return 0;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3] tracking-tight">Blog CMS</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">Write and publish SEO articles to drive organic traffic</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { fetchPosts(page); fetchStats(); }}
                        className="p-2 rounded-xl border border-white/5 hover:border-white/20 text-[#6b6f80] hover:text-[#f0f0f3] transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={14} />
                    </button>
                    <button
                        onClick={() => navigate('/admin/blog/new')}
                        className="admin-add-btn text-xs px-4 py-2 flex items-center gap-1.5"
                    >
                        <Plus size={14} /> New Article
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <StatCard icon={BookOpen}    label="Total Articles"  value={stats?.total}        color="bg-indigo-500/10 text-indigo-400"   loading={statsLoading} />
                <StatCard icon={Globe}       label="Published"       value={stats?.published}     color="bg-[#34d99a]/10 text-[#34d99a]"    loading={statsLoading} />
                <StatCard icon={FileText}    label="Drafts"          value={stats?.drafts}        color="bg-amber-500/10 text-amber-400"     loading={statsLoading} />
                <StatCard icon={TrendingUp}  label="Total Views"     value={stats?.total_views}   color="bg-blue-500/10 text-blue-400"       loading={statsLoading} />
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300 flex items-center justify-between">
                    <span className="flex items-center gap-2"><AlertCircle size={14} /> {error}</span>
                    <button onClick={() => setError('')}><X size={14} /></button>
                </div>
            )}

            {/* Filters & Sort */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4e5e]" size={15} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title or excerpt..."
                        className="w-full rounded-xl border border-[#1e2028] bg-[#0e0f14] py-2.5 pl-10 pr-4 text-sm text-[#f0f0f3] outline-none focus:border-[#34d99a]/40 transition-colors"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4e5e] hover:text-[#f0f0f3]"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    {/* Status filter chips */}
                    {['', 'published', 'draft'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl border transition-all ${
                                statusFilter === s
                                    ? 'border-[#34d99a]/40 bg-[#34d99a]/10 text-[#34d99a]'
                                    : 'border-[#1e2028] bg-[#0e0f14] text-[#6b6f80] hover:border-white/10 hover:text-[#f0f0f3]'
                            }`}
                        >
                            {s === '' ? 'All' : s === 'published' ? 'Live' : 'Drafts'}
                        </button>
                    ))}
                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="rounded-xl border border-[#1e2028] bg-[#0e0f14] px-3 py-2 text-[11px] font-bold text-[#6b6f80] outline-none focus:border-[#34d99a]/40"
                    >
                        <option value="-created_at">Newest First</option>
                        <option value="created_at">Oldest First</option>
                        <option value="-views_count">Most Viewed</option>
                        <option value="-read_time_minutes">Longest Read</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="stats-glass p-5 border border-white/5 rounded-xl space-y-4 animate-pulse">
                            <div className="h-40 w-full bg-[#15161b] rounded-lg" />
                            <div className="h-4 w-2/3 bg-[#1e2028] rounded" />
                            <div className="h-3 w-full bg-[#1e2028] rounded" />
                            <div className="h-3 w-4/5 bg-[#1e2028] rounded" />
                        </div>
                    ))
                ) : (sortedPosts.length === 0 && !error) ? (
                    <div className="col-span-full py-20 text-center text-[#6b6f80] flex flex-col items-center justify-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-[#16171e] flex items-center justify-center border border-white/5">
                            <BookOpen size={28} className="text-[#3c3e4f]" />
                        </div>
                        <div>
                            <p className="font-bold text-[#b0b3c0]">
                                {search || statusFilter ? 'No articles match your filters.' : 'No articles yet.'}
                            </p>
                            <p className="text-xs mt-1">
                                {search || statusFilter ? 'Try clearing your search or filter.' : 'Write your first article to get started.'}
                            </p>
                        </div>
                        {!search && !statusFilter && (
                            <button
                                onClick={() => navigate('/admin/blog/new')}
                                className="admin-add-btn text-xs px-4 py-2 flex items-center gap-1.5 mt-2"
                            >
                                <Plus size={14} /> Create First Article
                            </button>
                        )}
                    </div>
                ) : (
                    sortedPosts.map((post) => {
                        const isDeleting = deletingId === post.id;
                        const isToggling = togglingId === post.id;

                        return (
                            <div
                                key={post.id}
                                className={`stats-glass border border-white/5 bg-[#0e0f14]/50 rounded-xl overflow-hidden flex flex-col group hover:border-[#34d99a]/20 transition-all duration-300 ${isDeleting ? 'opacity-40 pointer-events-none scale-95' : ''}`}
                            >
                                {/* Cover */}
                                <div className="relative h-44 bg-[#16171e] flex items-center justify-center border-b border-white/5 overflow-hidden">
                                    {post.cover_image_url ? (
                                        <img
                                            src={post.cover_image_url}
                                            alt={post.title}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-[#3c3e4f]">
                                            <FileText size={32} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">No Cover</span>
                                        </div>
                                    )}
                                    {/* Status badge */}
                                    <span className={`absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider shadow-lg ${
                                        post.is_published
                                            ? 'bg-[#34d99a]/10 text-[#34d99a] border border-[#34d99a]/20'
                                            : 'bg-white/5 text-[#8b8fa3] border border-white/5'
                                    }`}>
                                        {post.is_published ? <><Globe size={8} /> Published</> : <><FileText size={8} /> Draft</>}
                                    </span>
                                    {/* View count badge */}
                                    <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold bg-black/60 text-[#b0b3c0] border border-white/5">
                                        <Eye size={8} /> {post.views_count || 0}
                                    </span>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-sm text-[#f0f0f3] line-clamp-2 group-hover:text-[#34d99a] transition-colors leading-snug">
                                            {post.title}
                                        </h3>
                                        <p className="text-xs text-[#8b8fa3] line-clamp-2 leading-relaxed">
                                            {post.excerpt || 'No summary provided.'}
                                        </p>
                                    </div>

                                    {/* Meta row */}
                                    <div className="flex items-center justify-between text-[10px] text-[#6b6f80] border-t border-white/5 pt-3">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} /> {post.read_time_minutes || 5} min read
                                        </span>
                                        <span className="flex items-center gap-1 font-mono text-[#4a4e5e]">
                                            /{post.slug?.slice(0, 12)}{post.slug?.length > 12 ? '…' : ''}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-1">
                                        <button
                                            onClick={() => togglePublishStatus(post)}
                                            disabled={isToggling}
                                            className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 ${
                                                post.is_published
                                                    ? 'border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10'
                                                    : 'border-[#34d99a]/20 bg-[#34d99a]/5 text-[#34d99a] hover:bg-[#34d99a]/10'
                                            }`}
                                        >
                                            {isToggling ? '...' : post.is_published ? 'Unpublish' : 'Publish'}
                                        </button>

                                        <div className="flex gap-1.5">
                                            {post.is_published && (
                                                <a
                                                    href={`/blog/${post.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 rounded-lg border border-white/5 hover:border-blue-500/30 text-[#b0b3c0] hover:text-blue-400 transition-colors"
                                                    title="View live"
                                                >
                                                    <ExternalLink size={12} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                                                className="p-1.5 rounded-lg border border-white/5 hover:border-white/20 text-[#b0b3c0] hover:text-[#f0f0f3] transition-colors"
                                                title="Edit article"
                                            >
                                                <Edit size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-1.5 rounded-lg border border-white/5 hover:border-red-500/30 text-[#b0b3c0] hover:text-red-400 transition-colors"
                                                title="Delete article"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <p className="text-xs text-[#6b6f80]">
                        Page <span className="text-[#f0f0f3] font-bold">{pagination.page}</span> of{' '}
                        <span className="text-[#f0f0f3] font-bold">{pagination.total_pages}</span>
                        <span className="ml-2 text-[#4a4e5e]">({pagination.total} articles)</span>
                    </p>
                    <div className="flex gap-1.5">
                        <button
                            disabled={!pagination.has_prev}
                            onClick={() => setPage(p => p - 1)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#1e2028] bg-[#0e0f14] text-xs text-[#b0b3c0] hover:border-[#34d99a]/40 hover:text-[#34d99a] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={12} /> Prev
                        </button>
                        {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`h-8 w-8 rounded-xl border text-xs font-bold transition-all ${
                                    p === page
                                        ? 'border-[#34d99a]/40 bg-[#34d99a]/10 text-[#34d99a]'
                                        : 'border-[#1e2028] bg-[#0e0f14] text-[#6b6f80] hover:border-white/10 hover:text-[#f0f0f3]'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            disabled={!pagination.has_next}
                            onClick={() => setPage(p => p + 1)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#1e2028] bg-[#0e0f14] text-xs text-[#b0b3c0] hover:border-[#34d99a]/40 hover:text-[#34d99a] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Next <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
