import { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useAuth } from '../../hooks/useAuth';
import { saveSection, fetchSection } from '../../lib/cms';

const ICON_OPTIONS = ['Rocket', 'Code2', 'Bot', 'Sparkles', 'Users', 'Layers', 'Globe', 'Zap', 'Trophy', 'Star'];

const defaultMilestones = [
    { year: '2023', title: 'Studio Founded', desc: 'Nowic Studio was born from a belief: great products deserve great execution.' },
    { year: '2024', title: '25+ Projects', desc: 'Expanded to full-stack platforms, AI apps, and healthcare solutions.' },
    { year: '2025', title: 'AI-First', desc: 'Integrated AI workflows for 3× faster product delivery.' },
    { year: '2026', title: '50+ & Growing', desc: 'Serving founders and enterprises across India and globally.' },
];

const createId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random().toString(16).slice(2)}`);

const normalizeWhyUs = (item = {}) => ({
    id: item.id || createId(),
    icon: typeof item.icon === 'string' ? item.icon : item.icon?.displayName || item.icon?.name || 'Rocket',
    title: item.title || '',
    desc: item.desc || '',
});

const normalizeValue = (item = '') => {
    if (typeof item === 'string') {
        return { id: createId(), text: item };
    }

    return {
        id: item.id || createId(),
        text: item.text || '',
    };
};

const normalizeMilestone = (item = {}) => ({
    id: item.id || createId(),
    year: item.year || '',
    title: item.title || '',
    desc: item.desc || '',
});

export default function AboutEditor() {
    const { content = {}, refetch } = useContent();
    const { getApiToken } = useAuth();
    const defaultWhyUs = content.whyUs || [];
    const defaultValues = content.teamValues || [];
    const [whyUs, setWhyUs] = useState([]);
    const [teamValues, setTeamValues] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const timeoutRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const [whyUsResult, valuesResult, milestonesResult] = await Promise.allSettled([
                fetchSection('whyUs'),
                fetchSection('teamValues'),
                fetchSection('milestones'),
            ]);

            if (!mounted) return;

            if (whyUsResult.status === 'rejected') {
                console.error('Failed to load whyUs:', whyUsResult.reason);
            }
            if (valuesResult.status === 'rejected') {
                console.error('Failed to load team values:', valuesResult.reason);
            }
            if (milestonesResult.status === 'rejected') {
                console.error('Failed to load milestones:', milestonesResult.reason);
            }

            const fallbackWhyUs = defaultWhyUs.map((item) => normalizeWhyUs(item));
            const fallbackValues = defaultValues.map((item) => normalizeValue(item));
            const fallbackMilestones = defaultMilestones.map((item) => normalizeMilestone(item));

            setWhyUs(normalizeArray(whyUsResult, fallbackWhyUs, normalizeWhyUs));
            setTeamValues(normalizeArray(valuesResult, fallbackValues, normalizeValue));
            setMilestones(normalizeArray(milestonesResult, fallbackMilestones, normalizeMilestone));
            setError('');
        })().catch((err) => {
            console.error('Failed to load about sections:', err);
            if (mounted) {
                setWhyUs(defaultWhyUs.map((item) => normalizeWhyUs(item)));
                setTeamValues(defaultValues.map((item) => normalizeValue(item)));
                setMilestones(defaultMilestones.map((item) => normalizeMilestone(item)));
                setError('Unable to load about sections. Using defaults.');
            }
        });

        return () => {
            mounted = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [defaultWhyUs, defaultValues]);

    function normalizeArray(result, fallback, normalizer) {
        if (result.status === 'fulfilled' && result.value) {
            return Array.isArray(result.value) ? result.value.map((item) => normalizer(item)) : fallback;
        }

        return fallback;
    }

    const updateWhyUs = (idx, field, val) => {
        setWhyUs((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
        setSaved(false);
        setError('');
    };

    const addWhyUs = () => {
        setWhyUs((prev) => [...prev, normalizeWhyUs()]);
        setSaved(false);
        setError('');
    };
    const removeWhyUs = (idx) => { setWhyUs((prev) => prev.filter((_, i) => i !== idx)); setSaved(false); };

    const updateValue = (idx, val) => {
        setTeamValues((prev) => prev.map((item, i) => i === idx ? { ...item, text: val } : item));
        setSaved(false);
        setError('');
    };
    const addValue = () => {
        setTeamValues((prev) => [...prev, normalizeValue()]);
        setSaved(false);
        setError('');
    };
    const removeValue = (idx) => { setTeamValues((prev) => prev.filter((_, i) => i !== idx)); setSaved(false); };

    const updateMilestone = (idx, field, val) => {
        setMilestones((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
        setSaved(false);
        setError('');
    };
    const addMilestone = () => {
        setMilestones((prev) => [...prev, normalizeMilestone()]);
        setSaved(false);
        setError('');
    };
    const removeMilestone = (idx) => { setMilestones((prev) => prev.filter((_, i) => i !== idx)); setSaved(false); };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await getApiToken();
            await saveSection('whyUs', whyUs, token);
            await saveSection('teamValues', teamValues, token);
            await saveSection('milestones', milestones, token);
            await refetch();
            setSaved(true);
            setError('');
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err?.message || String(err) || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3]">About Page</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">Why Us, values, and milestones.</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="admin-save-btn">
                    {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving...' : 'Save All'}</>}
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                    {error}
                </div>
            )}

            {/* Why Us */}
            <h2 className="text-sm font-bold text-[#34d99a] uppercase tracking-wider mb-3">Why Choose Us</h2>
            <div className="space-y-3 mb-8">
                {whyUs.map((item, idx) => (
                    <div key={item.id} className="rounded-xl border border-[#1e2028] bg-[#0e0f14] p-4">
                        <div className="flex justify-end mb-2">
                            <button onClick={() => removeWhyUs(idx)} aria-label="Delete why us entry" className="text-red-400 hover:text-red-300"><Trash2 size={13} /></button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                                <label htmlFor={`whyus-icon-${item.id}`} className="admin-label">Icon</label>
                                <select id={`whyus-icon-${item.id}`} value={item.icon} onChange={(e) => updateWhyUs(idx, 'icon', e.target.value)} className="admin-input">
                                    {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor={`whyus-title-${item.id}`} className="admin-label">Title</label>
                                <input id={`whyus-title-${item.id}`} type="text" value={item.title} onChange={(e) => updateWhyUs(idx, 'title', e.target.value)} className="admin-input" />
                            </div>
                            <div>
                                <label htmlFor={`whyus-desc-${item.id}`} className="admin-label">Description</label>
                                <input id={`whyus-desc-${item.id}`} type="text" value={item.desc} onChange={(e) => updateWhyUs(idx, 'desc', e.target.value)} className="admin-input" />
                            </div>
                        </div>
                    </div>
                ))}
                <button onClick={addWhyUs} className="admin-add-btn"><Plus size={14} /> Add Item</button>
            </div>

            {/* Team Values */}
            <h2 className="text-sm font-bold text-[#34d99a] uppercase tracking-wider mb-3">Team Values</h2>
            <div className="space-y-2 mb-8">
                {teamValues.map((item, idx) => (
                    <div key={item.id} className="flex gap-2">
                        <div className="flex-1">
                            <label htmlFor={`team-value-${item.id}`} className="admin-label">Value</label>
                            <input id={`team-value-${item.id}`} type="text" value={item.text} onChange={(e) => updateValue(idx, e.target.value)} className="admin-input flex-1" placeholder="Value statement" />
                        </div>
                        <button onClick={() => removeValue(idx)} aria-label="Delete value" className="text-red-400 hover:text-red-300 px-2 self-end"><Trash2 size={13} /></button>
                    </div>
                ))}
                <button onClick={addValue} className="admin-add-btn"><Plus size={14} /> Add Value</button>
            </div>

            {/* Milestones */}
            <h2 className="text-sm font-bold text-[#34d99a] uppercase tracking-wider mb-3">Milestones / Timeline</h2>
            <div className="space-y-3">
                {milestones.map((item, idx) => (
                    <div key={item.id} className="rounded-xl border border-[#1e2028] bg-[#0e0f14] p-4">
                        <div className="flex justify-end mb-2">
                            <button onClick={() => removeMilestone(idx)} aria-label="Delete milestone" className="text-red-400 hover:text-red-300"><Trash2 size={13} /></button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                                <label htmlFor={`milestone-year-${item.id}`} className="admin-label">Year</label>
                                <input id={`milestone-year-${item.id}`} type="text" value={item.year} onChange={(e) => updateMilestone(idx, 'year', e.target.value)} className="admin-input" placeholder="2024" />
                            </div>
                            <div>
                                <label htmlFor={`milestone-title-${item.id}`} className="admin-label">Title</label>
                                <input id={`milestone-title-${item.id}`} type="text" value={item.title} onChange={(e) => updateMilestone(idx, 'title', e.target.value)} className="admin-input" />
                            </div>
                            <div>
                                <label htmlFor={`milestone-desc-${item.id}`} className="admin-label">Description</label>
                                <input id={`milestone-desc-${item.id}`} type="text" value={item.desc} onChange={(e) => updateMilestone(idx, 'desc', e.target.value)} className="admin-input" />
                            </div>
                        </div>
                    </div>
                ))}
                <button onClick={addMilestone} className="admin-add-btn"><Plus size={14} /> Add Milestone</button>
            </div>
        </div>
    );
}
