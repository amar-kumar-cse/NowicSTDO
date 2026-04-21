import { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle2, Plus, Trash2 } from 'lucide-react';
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
    }, [defaults]);

    const update = (idx, field, value) => {
        setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
        setSaved(false);
        setError('');
    };

    const addItem = () => setItems((prev) => [...prev, normalizeItem()]);

    const removeItem = (idx) => {
        if (!confirm('Delete this FAQ?')) return;
        setItems((prev) => prev.filter((_, i) => i !== idx));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
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
            alert('Failed to save: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3]">FAQs</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">{items.length} questions</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={addItem} className="admin-add-btn"><Plus size={14} /> Add FAQ</button>
                    <button onClick={handleSave} disabled={saving} className="admin-save-btn">
                        {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving...' : 'Save'}</>}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                    {error}
                </div>
            )}

            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div key={item.id} className="rounded-xl border border-[#1e2028] bg-[#0e0f14] p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-bold text-[#34d99a]">#{idx + 1}</span>
                            <button onClick={() => removeItem(idx)} aria-label="Delete FAQ" className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor={`faq-q-${item.id}`} className="admin-label">Question</label>
                                <input id={`faq-q-${item.id}`} type="text" value={item.q} onChange={(e) => update(idx, 'q', e.target.value)} className="admin-input" placeholder="Enter question..." />
                            </div>
                            <div>
                                <label htmlFor={`faq-a-${item.id}`} className="admin-label">Answer</label>
                                <textarea id={`faq-a-${item.id}`} value={item.a} onChange={(e) => update(idx, 'a', e.target.value)} rows={2} className="admin-input resize-none" placeholder="Enter answer..." />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
