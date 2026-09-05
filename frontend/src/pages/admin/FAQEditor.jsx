import { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle2, Plus, Trash2, ArrowUp, ArrowDown, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useAuth } from '../../hooks/useAuth';
import { saveSection, fetchSection } from '../../lib/cms';

const createId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `faq-${Date.now()}-${Math.random().toString(16).slice(2)}`);

function normalizeItem(item = {}) {
    if (typeof item === 'string') {
        return { id: createId(), q: item, a: '' };
    }
    return {
        id: item.id || createId(),
        q: item.q || '',
        a: item.a || '',
    };
}

function normalizeItems(list) {
    return Array.isArray(list) ? list.map(normalizeItem) : [];
}

export default function FAQEditor() {
    const { content = {}, refetch } = useContent();
    const { getApiToken } = useAuth();
    const defaults = content.faqs || [];
    const [items, setItems] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [expandedPrevIdx, setExpandedPrevIdx] = useState(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const data = await fetchSection('faqs');
                if (mounted) {
                    setItems(normalizeItems(data || defaults || []));
                    setError('');
                }
            } catch (err) {
                console.error('Failed to load FAQs:', err);
                if (mounted) {
                    setItems(normalizeItems(defaults || []));
                    setError('Unable to load FAQs. Using defaults.');
                }
            }
        })();

        return () => {
            mounted = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const update = (idx, field, value) => {
        setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
        setSaved(false);
        setError('');
    };

    const addItem = () => {
        setItems((prev) => [...prev, normalizeItem()]);
        setSaved(false);
    };

    const removeItem = (idx) => {
        if (!confirm('Delete this FAQ?')) return;
        setItems((prev) => prev.filter((_, i) => i !== idx));
        setSaved(false);
    };

    const moveItem = (idx, direction) => {
        const list = [...items];
        if (direction === 'up' && idx > 0) {
            const temp = list[idx];
            list[idx] = list[idx - 1];
            list[idx - 1] = temp;
        } else if (direction === 'down' && idx < list.length - 1) {
            const temp = list[idx];
            list[idx] = list[idx + 1];
            list[idx + 1] = temp;
        }
        setItems(list);
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const token = await getApiToken();
            await saveSection('faqs', items, token);
            await refetch();
            setSaved(true);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err?.message || 'Failed to save FAQs');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 relative pb-10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3] tracking-tight">Frequently Asked Questions</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">{items.length} questions in catalog.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={addItem} className="admin-add-btn text-xs px-3 py-2 flex items-center gap-1">
                        <Plus size={14} /> Add FAQ
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
                
                {/* LEFT: FAQ list editor */}
                <div className="lg:col-span-3 space-y-4">
                    {items.map((item, idx) => (
                        <div key={item.id} className="stats-glass p-5 border border-white/5 rounded-xl space-y-4 relative group">
                            
                            {/* Controls */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="p-1 text-[#6b6f80] hover:text-white disabled:opacity-20 transition-colors">
                                    <ArrowUp size={14} />
                                </button>
                                <button onClick={() => moveItem(idx, 'down')} disabled={idx === items.length - 1} className="p-1 text-[#6b6f80] hover:text-white disabled:opacity-20 transition-colors">
                                    <ArrowDown size={14} />
                                </button>
                                <button onClick={() => removeItem(idx)} className="p-1 text-red-400/70 hover:text-red-400 transition-colors ml-1">
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest bg-[#34d99a]/10 text-[#34d99a] px-2 py-0.5 rounded">
                                    FAQ Question #{idx + 1}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="admin-label">Question</label>
                                    <input type="text" value={item.q} onChange={(e) => update(idx, 'q', e.target.value)} className="admin-input" placeholder="e.g. Do you sign NDAs?" />
                                </div>
                                <div>
                                    <label className="admin-label">Answer</label>
                                    <textarea value={item.a} onChange={(e) => update(idx, 'a', e.target.value)} rows={3} className="admin-input resize-none !h-auto py-2" placeholder="e.g. Yes, we sign standard NDAs before scoping out requirements..." />
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

                {/* RIGHT: Interactive Accordion Live Preview */}
                <div className="lg:col-span-2 sticky top-20 stats-glass p-5 border border-white/5 rounded-2xl space-y-6">
                    <div className="flex items-center gap-1.5 text-xs text-[#8b8fa3] font-bold uppercase tracking-widest border-b border-white/5 pb-3">
                        <Eye size={14} className="text-[#34d99a]" /> Interactive Live Preview
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] text-[#6b6f80] uppercase tracking-widest font-bold">Accordion Mockup (Click to test expand/collapse)</p>
                        
                        <div className="relative border border-white/5 rounded-xl bg-[#08090d] p-4 overflow-hidden space-y-2.5 min-h-[220px]">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:10px_10px]" />
                            
                            {items.length === 0 ? (
                                <div className="text-center py-10 text-xs text-[#6b6f80] italic">No FAQs added yet.</div>
                            ) : (
                                items.map((item, idx) => {
                                    const isExpanded = expandedPrevIdx === idx;
                                    return (
                                        <div key={idx} className="relative z-10 rounded-xl border border-white/5 bg-[#0e0f14]/50 overflow-hidden">
                                            <button
                                                onClick={() => setExpandedPrevIdx(isExpanded ? null : idx)}
                                                className="w-full p-3.5 flex items-center justify-between text-left transition-colors hover:bg-white/[0.02]"
                                            >
                                                <span className="text-[10px] font-bold text-[#e0e0e8] pr-4">{item.q || 'Untitled Question'}</span>
                                                <span className="text-[#34d99a] shrink-0">
                                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </span>
                                            </button>
                                            
                                            {isExpanded && (
                                                <div className="p-3.5 pt-0 border-t border-white/[0.02] text-[10px] text-[#8b8fa3] leading-relaxed animate-slide-in">
                                                    {item.a || 'No answer entered yet.'}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
