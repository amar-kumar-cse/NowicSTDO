import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ChevronLeft, Eye, Edit3, Image, Upload, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

import MarkdownRenderer from '../../components/common/MarkdownRenderer';

export default function BlogEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getApiToken } = useAuth();
    const fileInputRef = useRef(null);

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [readTime, setReadTime] = useState(5);
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [autoReadTime, setAutoReadTime] = useState(true);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Live word/char count
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const charCount = content.length;
    const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

    useEffect(() => {
        if (id) {
            fetchPostDetails();
        }
    }, [id]);

    // Auto-update read time from word count
    useEffect(() => {
        if (autoReadTime) {
            setReadTime(Math.max(1, Math.ceil(wordCount / 200)));
        }
    }, [wordCount, autoReadTime]);

    // Ctrl+S shortcut — uses a ref so the handler always has latest state
    const handleSaveRef = useRef(null);
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (handleSaveRef.current) handleSaveRef.current(e);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const fetchPostDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await getApiToken();
            const response = await api.admin_getBlogById(token, id);
            if (response.success) {
                const found = response.data;
                setTitle(found.title);
                setSlug(found.slug);
                setExcerpt(found.excerpt || '');
                setContent(found.content);
                setReadTime(found.read_time_minutes);
                setCoverImageUrl(found.cover_image_url || '');
                setIsPublished(found.is_published);
                // If the saved read time matches auto, keep autoReadTime on
                const words = (found.content || '').trim().split(/\s+/).length;
                const calc = Math.max(1, Math.ceil(words / 200));
                setAutoReadTime(found.read_time_minutes === calc);
            } else {
                setError('Blog post not found.');
            }
        } catch (err) {
            console.error('Failed to load post details:', err);
            setError('Failed to load blog post.');
        } finally {
            setLoading(false);
        }
    };

    const handleTitleChange = (val) => {
        setTitle(val);
        if (!id) {
            // Auto generate slug from title in creation mode
            setSlug(
                val
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
            );
        }
    };

    const handleImageUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        try {
            const token = await getApiToken();
            const result = await api.admin_uploadMedia(token, file, 'blog');
            if (result.success && result.data?.url) {
                setCoverImageUrl(result.data.url);
            } else {
                alert(result.error || 'Upload failed');
            }
        } catch (err) {
            alert('Image upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e?.preventDefault();
        if (!title.trim() || !slug.trim() || !content.trim()) {
            setError('Title, slug, and content are required.');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess(false);

        const payload = {
            title,
            slug,
            excerpt,
            content,
            read_time_minutes: parseInt(readTime) || 5,
            cover_image_url: coverImageUrl || undefined,
            is_published: isPublished
        };

        try {
            const token = await getApiToken();
            let result;
            if (id) {
                result = await api.admin_updateBlog(token, id, payload);
            } else {
                result = await api.admin_createBlog(token, payload);
            }

            if (result && result.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/admin/blog');
                }, 1000);
            } else {
                setError(result?.error || 'Failed to save blog post.');
            }
        } catch (err) {
            console.error('Save failed:', err);
            setError(err.message || 'Failed to save blog post.');
        } finally {
            setSaving(false);
        }
    };

    // Keep ref in sync with latest handleSave (fixes stale closure in Ctrl+S handler)
    handleSaveRef.current = handleSave;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0b0f]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#34d99a] border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-16">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/admin/blog')}
                        className="p-2 rounded-lg border border-white/5 hover:border-white/20 text-[#b0b3c0] hover:text-[#f0f0f3] transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-[#f0f0f3] tracking-tight">
                            {id ? 'Edit Article' : 'New Article'}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {id && isPublished && (
                        <a
                            href={`/blog/${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="outline-btn text-xs px-3 py-2 flex items-center gap-1.5"
                        >
                            <Eye size={13} /> View Live
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="outline-btn text-xs px-4 py-2 flex items-center gap-1.5"
                    >
                        {previewMode ? <><Edit3 size={14} /> Write</> : <><Eye size={14} /> Preview</>}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        title="Ctrl+S"
                        className="admin-save-btn text-xs px-4 py-2 flex items-center gap-1.5"
                    >
                        {success ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving...' : 'Save Article'}</>}
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            {!previewMode ? (
                <form onSubmit={handleSave} className="grid gap-6 md:grid-cols-3">
                    {/* Write Section */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="stats-glass p-5 border border-white/5 rounded-xl space-y-4">
                            <div>
                                <label className="admin-label">Article Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    className="admin-input"
                                    placeholder="Enter a catchy title..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="admin-label">Slug</label>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.replace(/\s+/g, '-'))}
                                    className="admin-input"
                                    placeholder="how-to-build-mvp"
                                    required
                                />
                            </div>
                            <div>
                                <label className="admin-label">Excerpt / Summary</label>
                                <textarea
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    rows={2}
                                    className="admin-input resize-none !h-auto py-2"
                                    placeholder="Short description for the card list..."
                                />
                            </div>
                            <div>
                                <label className="admin-label">Article Content (Markdown)</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={18}
                                    className="admin-input font-mono text-sm resize-none !h-auto py-3 leading-relaxed"
                                    placeholder="# Write your article here using standard markdown syntax..."
                                    required
                                />
                                {/* Live stats bar */}
                                <div className="mt-1.5 flex items-center gap-3 text-[10px] text-[#4a4e5e] font-mono">
                                    <span>{wordCount} words</span>
                                    <span>•</span>
                                    <span>{charCount} chars</span>
                                    <span>•</span>
                                    <span>~{estimatedReadTime} min read</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Settings Section */}
                    <div className="space-y-4">
                        <div className="stats-glass p-5 border border-white/5 rounded-xl space-y-5">
                            <h3 className="font-bold text-xs uppercase tracking-widest text-[#8b8fa3] border-b border-white/5 pb-2">Settings</h3>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#e0e0e8] font-bold">Status</span>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={isPublished}
                                        onChange={(e) => setIsPublished(e.target.checked)}
                                        className="h-4 w-4 rounded border-white/5 bg-[#16171e] accent-[#34d99a]"
                                    />
                                    <span className="text-xs text-[#bddfbc] font-bold">Publish Live</span>
                                </label>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="admin-label !mb-0">Read Time (min)</label>
                                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={autoReadTime}
                                            onChange={(e) => setAutoReadTime(e.target.checked)}
                                            className="h-3 w-3 rounded accent-[#34d99a]"
                                        />
                                        <span className="text-[10px] text-[#6b6f80] font-bold">Auto</span>
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    value={readTime}
                                    onChange={(e) => { setAutoReadTime(false); setReadTime(e.target.value); }}
                                    className={`admin-input ${autoReadTime ? 'opacity-50' : ''}`}
                                    min={1}
                                    readOnly={autoReadTime}
                                />
                                {autoReadTime && (
                                    <p className="mt-1 text-[10px] text-[#4a4e5e]">Calculated from word count</p>
                                )}
                            </div>

                            {/* Cover Image Upload */}
                            <div>
                                <label className="admin-label flex items-center gap-1.5"><Image size={13} /> Cover Image</label>
                                <div className="mt-2 space-y-3">
                                    {coverImageUrl ? (
                                        <div className="relative h-32 w-full overflow-hidden rounded-lg border border-white/5 bg-[#15161b]">
                                            <img
                                                src={coverImageUrl}
                                                alt="Cover preview"
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/image.png';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setCoverImageUrl('')}
                                                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-white/5 bg-[#15161b] text-[#4a4e5e]">
                                            <Image size={24} />
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        value={coverImageUrl}
                                        onChange={(e) => setCoverImageUrl(e.target.value)}
                                        className="admin-input text-xs"
                                        placeholder="Paste image URL or upload below"
                                    />
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            handleImageUpload(e.target.files?.[0]);
                                            e.target.value = '';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/5 bg-[#15161b] py-2 text-xs font-medium text-[#a0a3b1] transition-colors hover:border-[#34d99a]/40 hover:text-[#34d99a] disabled:opacity-50"
                                    >
                                        <Upload size={12} />
                                        {uploading ? 'Uploading image...' : 'Upload cover image'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                /* Live Markdown Preview */
                <div className="stats-glass p-8 border border-white/5 rounded-xl min-h-[400px]">
                    <div className="max-w-2xl mx-auto space-y-6">
                        {coverImageUrl && (
                            <div className="h-56 w-full rounded-2xl overflow-hidden border border-white/5 bg-[#16171e]">
                                <img src={coverImageUrl} alt="Blog Cover" className="h-full w-full object-cover" />
                            </div>
                        )}
                        <div className="space-y-2 border-b border-white/5 pb-6">
                            <h1 className="text-3xl font-black text-white tracking-tight">{title || 'Untitled Article'}</h1>
                            <div className="flex items-center gap-4 text-xs text-[#6b6f80]">
                                <span>{readTime} min read</span>
                                <span>•</span>
                                <span>Previewing draft</span>
                            </div>
                        </div>
                        <div className="prose prose-invert max-w-none text-[#b0b3c0]">
                            <MarkdownRenderer content={content || '*No content written yet.*'} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
