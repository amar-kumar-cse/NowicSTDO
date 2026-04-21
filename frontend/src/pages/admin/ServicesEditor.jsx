import { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle2, Plus, Trash2, GripVertical } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useAuth } from '../../hooks/useAuth';
import { saveSection, fetchSection } from '../../lib/cms';

const ICON_OPTIONS = ['Rocket', 'Building2', 'Bot', 'LayoutDashboard', 'Globe', 'Code2', 'Cpu', 'Layers', 'Sparkles', 'Zap', 'Trophy', 'Users', 'Star', 'ShieldCheck', 'Gauge'];

const emptyService = {
    id: '',
    icon: 'Rocket',
    title: '',
    headline: '',
    description: '',
    features: ['', '', ''],
    color: 'rgba(52,232,161,0.15)',
};

const createId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `service-${Date.now()}-${Math.random().toString(16).slice(2)}`);

export default function ServicesEditor() {
    const { content = {}, refetch } = useContent();
    const { getApiToken } = useAuth();
    const defaultServices = content.services || [];
    const [items, setItems] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        const normalize = (list) => (list || []).map((s) => ({
            id: s.id || createId(),
            ...s,
            icon: s.icon?.displayName || s.icon?.name || s.icon || 'Rocket',
        }));

        (async () => {
            try {
                const data = await fetchSection('services');
                if (mounted) {
                    setItems(normalize(data || defaultServices));
                }
            } catch (err) {
                console.error('Failed to load services:', err);
                if (mounted) {
                    setItems(normalize(defaultServices));
                }
            }
        })();

        return () => {
            mounted = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [defaultServices]);

    const update = (idx, field, value) => {
        setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
        setSaved(false);
    };

    const updateFeature = (idx, fIdx, value) => {
        setItems((prev) => prev.map((item, i) => {
            if (i !== idx) return item;
            const features = [...item.features];
            features[fIdx] = value;
            return { ...item, features };
        }));
        setSaved(false);
    };

    const addFeature = (idx) => {
        setItems((prev) => prev.map((item, i) => i === idx ? { ...item, features: [...item.features, ''] } : item));
        setSaved(false);
    };

    const removeFeature = (idx, fIdx) => {
        setItems((prev) => prev.map((item, i) => {
            if (i !== idx) return item;
            return { ...item, features: item.features.filter((_, j) => j !== fIdx) };
        }));
        setSaved(false);
    };

    const addItem = () => setItems((prev) => [...prev, { ...emptyService, id: createId(), features: ['', '', ''] }]);

    const removeItem = (idx) => {
        if (!confirm('Delete this service?')) return;
        setItems((prev) => prev.filter((_, i) => i !== idx));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await getApiToken();
            await saveSection('services', items, token);
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
                    <h1 className="text-2xl font-bold text-[#f0f0f3]">Services</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">{items.length} services</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={addItem} className="admin-add-btn">
                        <Plus size={14} /> Add Service
                    </button>
                    <button onClick={handleSave} disabled={saving} className="admin-save-btn">
                        {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving...' : 'Save'}</>}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {items.map((item, idx) => (
                    <div key={item.id} className="rounded-xl border border-[#1e2028] bg-[#0e0f14] p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <GripVertical size={14} className="text-[#4a4e5e]" />
                                <span className="text-xs font-bold text-[#34d99a]">#{idx + 1}</span>
                            </div>
                            <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="admin-label">Icon</label>
                                <select value={item.icon} onChange={(e) => update(idx, 'icon', e.target.value)} className="admin-input">
                                    {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="admin-label">Title</label>
                                <input type="text" value={item.title} onChange={(e) => update(idx, 'title', e.target.value)} className="admin-input" placeholder="Service title" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="admin-label">Headline</label>
                                <input type="text" value={item.headline} onChange={(e) => update(idx, 'headline', e.target.value)} className="admin-input" placeholder="Short headline" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="admin-label">Description</label>
                                <textarea value={item.description} onChange={(e) => update(idx, 'description', e.target.value)} rows={2} className="admin-input resize-none" placeholder="Service description" />
                            </div>
                        </div>

                        {/* Features */}
                        <div className="mt-4">
                            <label className="admin-label">Features</label>
                            <div className="space-y-2">
                                {item.features.map((f, fIdx) => (
                                    <div key={fIdx} className="flex gap-2">
                                        <input type="text" value={f} onChange={(e) => updateFeature(idx, fIdx, e.target.value)} className="admin-input flex-1" placeholder={`Feature ${fIdx + 1}`} />
                                        <button onClick={() => removeFeature(idx, fIdx)} className="text-red-400 hover:text-red-300 px-2"><Trash2 size={12} /></button>
                                    </div>
                                ))}
                                <button onClick={() => addFeature(idx)} className="text-xs text-[#34d99a] hover:underline">+ Add feature</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
