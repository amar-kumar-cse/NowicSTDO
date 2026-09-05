import { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle2, Plus, Trash2, Star, ArrowUp, ArrowDown, Eye, ExternalLink, Github, Image, Upload } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useAuth } from '../../hooks/useAuth';
import { saveSection, fetchSection } from '../../lib/cms';
import { api, resolveImageUrl } from '../../lib/api';

const emptyProject = {
    title: '',
    category: '',
    description: '',
    tech_stack: [],
    image_url: '',
    is_featured: false,
    live_url: '',
    github_url: '',
};

const DEFAULT_SERVICES = [
    'MVP Development',
    'Business Website',
    'AI Web App',
    'Admin Dashboard',
    'SaaS Platform',
    'API & Backend',
    'Mobile App',
    'E-Commerce'
];

const createId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `project-${Date.now()}-${Math.random().toString(16).slice(2)}`);

function normalizeProject(item = {}) {
    return {
        id: item.id || createId(),
        ...emptyProject,
        ...item,
        tech_stack: Array.isArray(item.tech_stack) ? item.tech_stack : (Array.isArray(item.tags) ? item.tags : []),
        is_featured: item.is_featured ?? item.featured ?? false,
        live_url: item.live_url || item.demoUrl || '',
        github_url: item.github_url || item.githubUrl || '',
    };
}

export default function PortfolioEditor() {
    const { content = {}, refetch } = useContent();
    const { getApiToken } = useAuth();
    const defaults = content.portfolioItems || [];
    const [items, setItems] = useState([]);
    const [services, setServices] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [uploading, setUploading] = useState({});
    const [activePreviewIdx, setActivePreviewIdx] = useState(0);
    const [error, setError] = useState('');
    const savedTimeoutRef = useRef(null);
    const fileInputRefs = useRef({});

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const data = await fetchSection('portfolioItems');
                if (mounted) {
                    setItems((data || defaults || []).map(normalizeProject));
                }
            } catch (err) {
                console.error('Failed to load portfolio items:', err);
                if (mounted) {
                    setItems((defaults || []).map(normalizeProject));
                }
            }
        })();

        (async () => {
            try {
                const response = await api.getServices();
                const list = response.data || response || [];
                if (mounted) {
                    setServices((list || []).filter(s => s.is_active).map(s => s.name));
                }
            } catch (err) {
                console.error('Failed to load active services:', err);
            }
        })();

        return () => {
            mounted = false;
            if (savedTimeoutRef.current) {
                clearTimeout(savedTimeoutRef.current);
            }
        };
    }, []);

    const update = (idx, field, value) => {
        setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
        setSaved(false);
    };

    const updateTags = (idx, value) => {
        const tags = value.split(',').map((t) => t.trim()).filter(Boolean);
        update(idx, 'tech_stack', tags);
    };

    const addItem = () => {
        setItems((prev) => [...prev, normalizeProject()]);
        setActivePreviewIdx(items.length);
        setSaved(false);
    };

    const removeItem = (idx) => {
        if (!confirm('Delete this project?')) return;
        setItems((prev) => prev.filter((_, i) => i !== idx));
        if (activePreviewIdx >= items.length - 1 && activePreviewIdx > 0) {
            setActivePreviewIdx(activePreviewIdx - 1);
        }
        setSaved(false);
    };

    const moveItem = (idx, direction) => {
        const list = [...items];
        if (direction === 'up' && idx > 0) {
            const temp = list[idx];
            list[idx] = list[idx - 1];
            list[idx - 1] = temp;
            setActivePreviewIdx(idx - 1);
        } else if (direction === 'down' && idx < list.length - 1) {
            const temp = list[idx];
            list[idx] = list[idx + 1];
            list[idx + 1] = temp;
            setActivePreviewIdx(idx + 1);
        }
        setItems(list);
        setSaved(false);
    };

    const handleImageUpload = async (idx, file) => {
        if (!file) return;
        setUploading((prev) => ({ ...prev, [idx]: true }));
        try {
            const token = await getApiToken();
            const result = await api.admin_uploadMedia(token, file, 'portfolio');
            if (result.success && result.data?.url) {
                update(idx, 'image_url', result.data.url);
            } else {
                alert(result.error || 'Upload failed');
            }
        } catch (err) {
            alert('Image upload failed: ' + err.message);
        } finally {
            setUploading((prev) => ({ ...prev, [idx]: false }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        let saveSucceeded = false;

        try {
            const token = await getApiToken();
            await saveSection('portfolioItems', items, token);
            saveSucceeded = true;
            setSaved(true);
            if (savedTimeoutRef.current) {
                clearTimeout(savedTimeoutRef.current);
            }
            savedTimeoutRef.current = setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err?.message || 'Failed to save portfolio items');
        } finally {
            if (saveSucceeded) {
                try {
                    await refetch();
                } catch (err) {
                    console.warn(err);
                }
            }
            setSaving(false);
        }
    };

    const previewItem = items[activePreviewIdx];

    return (
        <div className="space-y-6 relative pb-10">
            
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3] tracking-tight">Portfolio Items</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">{items.length} works in showcase.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={addItem} className="admin-add-btn text-xs px-3 py-2 flex items-center gap-1">
                        <Plus size={14} /> Add Project
                    </button>
                    <button onClick={handleSave} disabled={saving} className="admin-save-btn text-xs px-4 py-2 flex items-center gap-1.5">
                        {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}</>}
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                    {error}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-5 items-start">
                
                {/* LEFT: Project editor cards */}
                <div className="lg:col-span-3 space-y-4">
                    {items.map((item, idx) => (
                        <div 
                            key={item.id} 
                            onClick={() => setActivePreviewIdx(idx)}
                            className={`stats-glass p-5 border rounded-xl space-y-4 relative group cursor-pointer transition-all ${
                                activePreviewIdx === idx 
                                    ? 'border-[#34d99a]/35 shadow-[0_4px_25px_rgba(52,217,154,0.03)] bg-white/[0.03]' 
                                    : 'border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
                            }`}
                        >
                            
                            {/* Controls */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); moveItem(idx, 'up'); }} disabled={idx === 0} className="p-1 text-[#6b6f80] hover:text-white disabled:opacity-20 transition-colors">
                                    <ArrowUp size={14} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); moveItem(idx, 'down'); }} disabled={idx === items.length - 1} className="p-1 text-[#6b6f80] hover:text-white disabled:opacity-20 transition-colors">
                                    <ArrowDown size={14} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); removeItem(idx); }} className="p-1 text-red-400/70 hover:text-red-400 transition-colors ml-1">
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest bg-[#34d99a]/10 text-[#34d99a] px-2 py-0.5 rounded">
                                    Project #{idx + 1}
                                </span>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="admin-label">Title</label>
                                    <input type="text" value={item.title} onChange={(e) => update(idx, 'title', e.target.value)} className="admin-input" placeholder="Project name" />
                                </div>
                                <div>
                                    <label className="admin-label">Category</label>
                                    {(() => {
                                        const serviceOptions = services.length > 0 ? services : DEFAULT_SERVICES;
                                        const isCustom = item.category && !serviceOptions.includes(item.category);
                                        const dropdownValue = isCustom ? 'Other' : item.category;

                                        return (
                                            <div className="space-y-2">
                                                <select 
                                                    value={dropdownValue} 
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === 'Other') {
                                                            update(idx, 'category', 'Custom Category');
                                                        } else {
                                                            update(idx, 'category', val);
                                                        }
                                                    }} 
                                                    className="admin-input"
                                                >
                                                    <option value="">Select Category...</option>
                                                    {serviceOptions.map((s) => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                    <option value="Other">Other (Custom Type)...</option>
                                                </select>

                                                {isCustom && (
                                                    <input 
                                                        type="text" 
                                                        value={item.category === 'Custom Category' ? '' : item.category} 
                                                        onChange={(e) => update(idx, 'category', e.target.value)} 
                                                        className="admin-input text-xs py-1.5 focus:border-[#34d99a]/40" 
                                                        placeholder="Enter custom category name..." 
                                                    />
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div>
                                <label className="admin-label">Description</label>
                                <textarea value={item.description} onChange={(e) => update(idx, 'description', e.target.value)} rows={3} className="admin-input resize-none !h-auto py-2" placeholder="Tell us about the project..." />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="admin-label">Tech Stack (comma-separated)</label>
                                    <input type="text" value={(item.tech_stack || []).join(', ')} onChange={(e) => updateTags(idx, e.target.value)} className="admin-input" placeholder="React, Node.js, SQLite" />
                                </div>
                                <div className="flex items-center h-full pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={item.is_featured || false}
                                            onChange={(e) => update(idx, 'is_featured', e.target.checked)}
                                            className="h-4 w-4 rounded border-white/5 bg-[#16171e] accent-[#34d99a]"
                                        />
                                        <span className="text-xs text-[#e0e0e8] flex items-center gap-1 font-bold">
                                            <Star size={12} className={item.is_featured ? 'text-amber-400 fill-amber-400' : 'text-[#8b8fa3]'} />
                                            Featured Work
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="admin-label">Live App URL</label>
                                    <input type="url" value={item.live_url || ''} onChange={(e) => update(idx, 'live_url', e.target.value)} className="admin-input" placeholder="https://app.nowicstudio.com" />
                                </div>
                                <div>
                                    <label className="admin-label">GitHub Repository URL</label>
                                    <input type="url" value={item.github_url || ''} onChange={(e) => update(idx, 'github_url', e.target.value)} className="admin-input" placeholder="https://github.com/NowicStudio/..." />
                                </div>
                            </div>

                            {/* Cover image uploader */}
                            <div>
                                <label className="admin-label flex items-center gap-1.5"><Image size={13} /> Project Screenshot</label>
                                <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start">
                                    {item.image_url ? (
                                        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-white/5 bg-[#15161b]">
                                            <img
                                                src={resolveImageUrl(item.image_url)}
                                                alt={item.title || 'Project Screenshot'}
                                                className="h-full w-full object-cover"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => update(idx, 'image_url', '')}
                                                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/5 bg-[#15161b] text-[#4a4e5e]">
                                            <Image size={20} />
                                        </div>
                                    )}
                                    <div className="flex flex-1 flex-col gap-2">
                                        <input
                                            type="text"
                                            value={item.image_url || ''}
                                            onChange={(e) => update(idx, 'image_url', e.target.value)}
                                            className="admin-input"
                                            placeholder="Paste screenshot URL or upload below"
                                        />
                                        <input
                                            ref={(el) => { fileInputRefs.current[idx] = el; }}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                handleImageUpload(idx, e.target.files?.[0]);
                                                e.target.value = '';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRefs.current[idx]?.click()}
                                            disabled={uploading[idx]}
                                            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-white/5 bg-[#15161b] px-3 py-1.5 text-xs font-medium text-[#a0a3b1] transition-colors hover:border-[#34d99a]/40 hover:text-[#34d99a] disabled:opacity-50"
                                        >
                                            <Upload size={12} />
                                            {uploading[idx] ? 'Uploading...' : 'Upload Image'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

                {/* RIGHT: Live Project Preview */}
                <div className="lg:col-span-2 sticky top-20 stats-glass p-5 border border-white/5 rounded-2xl space-y-6">
                    <div className="flex items-center gap-1.5 text-xs text-[#8b8fa3] font-bold uppercase tracking-widest border-b border-white/5 pb-3">
                        <Eye size={14} className="text-[#34d99a]" /> Card Live Preview
                    </div>

                    {previewItem ? (
                        <div className="space-y-4">
                            <p className="text-[10px] text-[#6b6f80] uppercase tracking-widest font-bold">Active Card Mockup</p>
                            <div className="relative border border-white/5 rounded-2xl bg-[#08090d] overflow-hidden min-h-[300px] flex flex-col justify-between">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:10px_10px]" />
                                
                                <div>
                                    {/* Cover image mockup */}
                                    {previewItem.image_url ? (
                                        <div className="relative h-40 w-full overflow-hidden border-b border-white/5 bg-[#15161b]">
                                            <img src={resolveImageUrl(previewItem.image_url)} alt="Cover Preview" className="h-full w-full object-cover" />
                                            {previewItem.is_featured && (
                                                <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-[#34d99a] text-black px-2 py-0.5 text-[8px] font-black uppercase tracking-wider shadow-lg">
                                                    <Star size={9} className="fill-black text-black" /> Featured
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex h-40 w-full items-center justify-center border-b border-white/5 bg-[#15161b] text-[#4a4e5e] relative">
                                            <Image size={24} />
                                            {previewItem.is_featured && (
                                                <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-[#34d99a] text-black px-2 py-0.5 text-[8px] font-black uppercase tracking-wider shadow-lg">
                                                    <Star size={9} className="fill-black text-black" /> Featured
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="p-5 space-y-2">
                                        <span className="text-[9px] font-bold text-[#34d99a] uppercase tracking-widest bg-[#34d99a]/10 px-2 py-0.5 rounded">
                                            {previewItem.category || 'Category'}
                                        </span>
                                        <h3 className="text-sm font-extrabold text-white pt-1">{previewItem.title || 'Project Name'}</h3>
                                        <p className="text-[10px] text-[#8b8fa3] leading-relaxed line-clamp-3">{previewItem.description || 'Project description goes here'}</p>
                                    </div>
                                </div>

                                <div className="px-5 pb-5 pt-2 border-t border-white/[0.03] flex items-center justify-between z-10">
                                    {/* Tech tags */}
                                    <div className="flex flex-wrap gap-1 max-w-[70%]">
                                        {previewItem.tech_stack.slice(0, 3).map((tag, tIdx) => (
                                            <span key={tIdx} className="text-[8px] text-[#8b8fa3] border border-white/5 bg-white/[0.02] px-1.5 py-0.5 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                        {previewItem.tech_stack.length > 3 && (
                                            <span className="text-[8px] text-[#6b6f80] px-1 py-0.5 font-bold">+{previewItem.tech_stack.length - 3}</span>
                                        )}
                                    </div>

                                    {/* Link buttons */}
                                    <div className="flex gap-2">
                                        {previewItem.github_url && (
                                            <a href={previewItem.github_url} target="_blank" rel="noreferrer" className="text-[#8b8fa3] hover:text-white transition-colors">
                                                <Github size={14} />
                                            </a>
                                        )}
                                        {previewItem.live_url && (
                                            <a href={previewItem.live_url} target="_blank" rel="noreferrer" className="text-[#34d99a] hover:text-mint transition-colors">
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-xs text-[#6b6f80] italic">Select a portfolio item card on the left to preview it visually.</div>
                    )}
                </div>

            </div>
        </div>
    );
}
