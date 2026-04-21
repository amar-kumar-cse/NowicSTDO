import { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle2, Plus, Trash2, Star } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useAuth } from '../../hooks/useAuth';
import { saveSection, fetchSection } from '../../lib/cms';

const emptyProject = {
    title: '',
    category: '',
    description: '',
    tags: [],
    gradient: 'from-mint/25 via-jade/10 to-emerald/20',
    featured: false,
    demoUrl: '',
    githubUrl: '',
};

const CATEGORY_OPTIONS = ['Full-Stack Platform', 'Business Website', 'AI Web Application', 'Healthcare Platform', 'SaaS Platform', 'Mobile App', 'Dashboard', 'Other'];

const createId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `project-${Date.now()}-${Math.random().toString(16).slice(2)}`);

function normalizeProject(item = {}) {
    return {
        id: item.id || createId(),
        ...emptyProject,
        ...item,
        tags: Array.isArray(item.tags) ? item.tags : [],
    };
}

export default function PortfolioEditor() {
    const { content = {}, refetch } = useContent();
    const { getApiToken } = useAuth();
    const defaults = content.portfolioItems || [];
    const [items, setItems] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const savedTimeoutRef = useRef(null);

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

        return () => {
            mounted = false;
            if (savedTimeoutRef.current) {
                clearTimeout(savedTimeoutRef.current);
            }
        };
    }, [defaults]);

    const update = (idx, field, value) => {
        setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
        setSaved(false);
    };

    const updateTags = (idx, value) => {
        const tags = value.split(',').map((t) => t.trim()).filter(Boolean);
        update(idx, 'tags', tags);
    };

    const addItem = () => setItems((prev) => [...prev, normalizeProject()]);

    const removeItem = (idx) => {
        if (!confirm('Delete this project?')) return;
        setItems((prev) => prev.filter((_, i) => i !== idx));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
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
            alert('Failed to save: ' + err.message);
        } finally {
            if (saveSucceeded) {
                try {
                    await refetch();
                } catch (err) {
                    console.warn('Saved successfully, but failed to refresh data:', err);
                }
            }
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3]">Portfolio</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">{items.length} projects</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={addItem} className="admin-add-btn"><Plus size={14} /> Add Project</button>
                    <button onClick={handleSave} disabled={saving} className="admin-save-btn">
                        {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving...' : 'Save'}</>}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {items.map((item, idx) => (
                    <div key={item.id} className="rounded-xl border border-[#1e2028] bg-[#0e0f14] p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-[#34d99a]">#{idx + 1}</span>
                                {item.featured && (
                                    <span className="flex items-center gap-1 rounded-full bg-[#34d99a]/10 px-2 py-0.5 text-[10px] font-semibold text-[#34d99a]">
                                        <Star size={10} /> Featured
                                    </span>
                                )}
                            </div>
                            <button onClick={() => removeItem(idx)} aria-label="Delete project" className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor={`title-${item.id}`} className="admin-label">Title</label>
                                <input id={`title-${item.id}`} type="text" value={item.title} onChange={(e) => update(idx, 'title', e.target.value)} className="admin-input" placeholder="Project title" />
                            </div>
                            <div>
                                <label htmlFor={`category-${item.id}`} className="admin-label">Category</label>
                                <select id={`category-${item.id}`} value={item.category} onChange={(e) => update(idx, 'category', e.target.value)} className="admin-input">
                                    <option value="">Select...</option>
                                    {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor={`description-${item.id}`} className="admin-label">Description</label>
                                <textarea id={`description-${item.id}`} value={item.description} onChange={(e) => update(idx, 'description', e.target.value)} rows={2} className="admin-input resize-none" placeholder="Project description" />
                            </div>
                            <div>
                                <label htmlFor={`tags-${item.id}`} className="admin-label">Tags (comma-separated)</label>
                                <input id={`tags-${item.id}`} type="text" value={(item.tags || []).join(', ')} onChange={(e) => updateTags(idx, e.target.value)} className="admin-input" placeholder="React, Node.js, PostgreSQL" />
                            </div>
                            <div className="flex items-end gap-4">
                                <label className="flex items-center gap-2 cursor-pointer" htmlFor={`featured-${item.id}`}>
                                    <input
                                        id={`featured-${item.id}`}
                                        type="checkbox"
                                        checked={item.featured || false}
                                        onChange={(e) => update(idx, 'featured', e.target.checked)}
                                        className="h-4 w-4 rounded border-[#1e2028] bg-[#16171e] accent-[#34d99a]"
                                    />
                                    <span className="text-sm text-[#e0e0e8]">Featured Project</span>
                                </label>
                            </div>
                            <div>
                                <label htmlFor={`demoUrl-${item.id}`} className="admin-label">Demo URL</label>
                                <input id={`demoUrl-${item.id}`} type="url" value={item.demoUrl || ''} onChange={(e) => update(idx, 'demoUrl', e.target.value)} className="admin-input" placeholder="https://..." />
                            </div>
                            <div>
                                <label htmlFor={`githubUrl-${item.id}`} className="admin-label">GitHub URL</label>
                                <input id={`githubUrl-${item.id}`} type="url" value={item.githubUrl || ''} onChange={(e) => update(idx, 'githubUrl', e.target.value)} className="admin-input" placeholder="https://github.com/..." />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
