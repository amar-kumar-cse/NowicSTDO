import { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle2, Plus, Trash2, ArrowUp, ArrowDown, Eye, HelpCircle, Bot, Building2, LayoutDashboard, Rocket, Gauge, ShieldCheck, Cpu, Layers, Sparkles, Code2, Globe, Zap, Trophy, Users, Star, Check } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useAuth } from '../../hooks/useAuth';
import { saveSection, fetchSection } from '../../lib/cms';

const ICON_MAP = {
    Bot, Building2, LayoutDashboard, Rocket, Gauge, ShieldCheck,
    Cpu, Layers, Sparkles, Code2, Globe, Zap, Trophy, Users, Star
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

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
    const [activeSection, setActiveSection] = useState('whyus'); // whyus | values | milestones
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
    }, []);

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
    };

    const removeWhyUs = (idx) => {
        setWhyUs((prev) => prev.filter((_, i) => i !== idx));
        setSaved(false);
    };

    const updateValue = (idx, val) => {
        setTeamValues((prev) => prev.map((item, i) => i === idx ? { ...item, text: val } : item));
        setSaved(false);
        setError('');
    };

    const addValue = () => {
        setTeamValues((prev) => [...prev, normalizeValue()]);
        setSaved(false);
    };

    const removeValue = (idx) => {
        setTeamValues((prev) => prev.filter((_, i) => i !== idx));
        setSaved(false);
    };

    const updateMilestone = (idx, field, val) => {
        setMilestones((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
        setSaved(false);
        setError('');
    };

    const addMilestone = () => {
        setMilestones((prev) => [...prev, normalizeMilestone()]);
        setSaved(false);
    };

    const removeMilestone = (idx) => {
        setMilestones((prev) => prev.filter((_, i) => i !== idx));
        setSaved(false);
    };

    const moveItem = (section, idx, direction) => {
        const list = section === 'whyus' ? [...whyUs] : section === 'values' ? [...teamValues] : [...milestones];
        const setList = section === 'whyus' ? setWhyUs : section === 'values' ? setTeamValues : setMilestones;
        
        if (direction === 'up' && idx > 0) {
            const temp = list[idx];
            list[idx] = list[idx - 1];
            list[idx - 1] = temp;
        } else if (direction === 'down' && idx < list.length - 1) {
            const temp = list[idx];
            list[idx] = list[idx + 1];
            list[idx + 1] = temp;
        }
        setList(list);
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const token = await getApiToken();
            
            // Sequential saves to prevent SQLite locks
            await saveSection('whyUs', whyUs, token);
            await saveSection('teamValues', teamValues, token);
            await saveSection('milestones', milestones, token);
            
            await refetch();
            setSaved(true);
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

    const PreviewIcon = ({ name, className }) => {
        const IconComponent = ICON_MAP[name] || HelpCircle;
        return <IconComponent className={className} />;
    };

    return (
        <div className="space-y-6 relative pb-10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3] tracking-tight">About Us settings</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">Manage milestones timeline, unique selling propositions, and culture values.</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="admin-save-btn flex items-center gap-1.5 text-xs px-4 py-2">
                    {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}</>}
                </button>
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                    {error}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-5 items-start">
                
                {/* LEFT: Editors suite */}
                <div className="lg:col-span-3 space-y-6">
                    
                    {/* Section Switcher Tabs */}
                    <div className="flex gap-2 bg-[#0e0f14]/80 border border-white/5 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveSection('whyus')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                                activeSection === 'whyus' 
                                    ? 'bg-[#34d99a]/10 text-[#34d99a] border border-[#34d99a]/20' 
                                    : 'text-[#8b8fa3] hover:text-white border border-transparent'
                            }`}
                        >
                            Why Us
                        </button>
                        <button
                            onClick={() => setActiveSection('values')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                                activeSection === 'values' 
                                    ? 'bg-[#34d99a]/10 text-[#34d99a] border border-[#34d99a]/20' 
                                    : 'text-[#8b8fa3] hover:text-white border border-transparent'
                            }`}
                        >
                            Team Values
                        </button>
                        <button
                            onClick={() => setActiveSection('milestones')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                                activeSection === 'milestones' 
                                    ? 'bg-[#34d99a]/10 text-[#34d99a] border border-[#34d99a]/20' 
                                    : 'text-[#8b8fa3] hover:text-white border border-transparent'
                            }`}
                        >
                            Timeline Milestones
                        </button>
                    </div>

                    {/* Why Us Editor */}
                    {activeSection === 'whyus' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#8b8fa3]">Unique Selling Points</h3>
                                <button onClick={addWhyUs} className="admin-add-btn text-xs px-3 py-1.5 flex items-center gap-1">
                                    <Plus size={13} /> Add Point
                                </button>
                            </div>

                            <div className="space-y-4">
                                {whyUs.map((item, idx) => (
                                    <div key={item.id} className="stats-glass p-5 border border-white/5 rounded-xl space-y-4 relative group">
                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                            <button onClick={() => moveItem('whyus', idx, 'up')} disabled={idx === 0} className="p-1 text-[#6b6f80] hover:text-white disabled:opacity-20 transition-colors">
                                                <ArrowUp size={14} />
                                            </button>
                                            <button onClick={() => moveItem('whyus', idx, 'down')} disabled={idx === whyUs.length - 1} className="p-1 text-[#6b6f80] hover:text-white disabled:opacity-20 transition-colors">
                                                <ArrowDown size={14} />
                                            </button>
                                            <button onClick={() => removeWhyUs(idx)} className="p-1 text-red-400/70 hover:text-red-400 transition-colors ml-1">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="admin-label">Title</label>
                                                <input type="text" value={item.title} onChange={(e) => updateWhyUs(idx, 'title', e.target.value)} className="admin-input" placeholder="Title text" />
                                            </div>
                                            <div>
                                                <label className="admin-label">Description</label>
                                                <input type="text" value={item.desc} onChange={(e) => updateWhyUs(idx, 'desc', e.target.value)} className="admin-input" placeholder="Short USP description" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="admin-label font-bold">Visual Icon Component</label>
                                            <div className="grid grid-cols-8 gap-1 border border-white/5 rounded-lg p-1 bg-black/40 w-fit">
                                                {ICON_OPTIONS.map((ic) => {
                                                    const IconComp = ICON_MAP[ic];
                                                    const isSelected = item.icon === ic;
                                                    return (
                                                        <button
                                                            key={ic}
                                                            type="button"
                                                            onClick={() => updateWhyUs(idx, 'icon', ic)}
                                                            title={ic}
                                                            className={`p-1.5 rounded flex items-center justify-center transition-all ${
                                                                isSelected 
                                                                    ? 'bg-[#34d99a] text-black shadow-lg scale-105' 
                                                                    : 'text-[#8b8fa3] hover:bg-white/[0.05] hover:text-white'
                                                            }`}
                                                        >
                                                            <IconComp size={13} />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Team Values Editor */}
                    {activeSection === 'values' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#8b8fa3]">Company Core Values</h3>
                                <button onClick={addValue} className="admin-add-btn text-xs px-3 py-1.5 flex items-center gap-1">
                                    <Plus size={13} /> Add Value
                                </button>
                            </div>

                            <div className="space-y-3">
                                {teamValues.map((item, idx) => (
                                    <div key={item.id} className="stats-glass p-3 border border-white/5 rounded-xl flex items-center justify-between gap-3 group">
                                        <div className="flex-1">
                                            <input type="text" value={item.text} onChange={(e) => updateValue(idx, e.target.value)} className="admin-input flex-1" placeholder="Culture/Team core statement" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => moveItem('values', idx, 'up')} disabled={idx === 0} className="p-1 text-[#6b6f80] hover:text-white disabled:opacity-20 transition-colors">
                                                <ArrowUp size={14} />
                                            </button>
                                            <button onClick={() => moveItem('values', idx, 'down')} disabled={idx === teamValues.length - 1} className="p-1 text-[#6b6f80] hover:text-white disabled:opacity-20 transition-colors">
                                                <ArrowDown size={14} />
                                            </button>
                                            <button onClick={() => removeValue(idx)} className="p-1 text-red-400/70 hover:text-red-400 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Milestones Editor */}
                    {activeSection === 'milestones' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#8b8fa3]">Timeline Milestones</h3>
                                <button onClick={addMilestone} className="admin-add-btn text-xs px-3 py-1.5 flex items-center gap-1">
                                    <Plus size={13} /> Add Milestone
                                </button>
                            </div>

                            <div className="space-y-4">
                                {milestones.map((item, idx) => (
                                    <div key={item.id} className="stats-glass p-5 border border-white/5 rounded-xl space-y-4 relative group">
                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                            <button onClick={() => moveItem('milestones', idx, 'up')} disabled={idx === 0} className="p-1 text-[#6b6f80] hover:text-white disabled:opacity-20 transition-colors">
                                                <ArrowUp size={14} />
                                            </button>
                                            <button onClick={() => moveItem('milestones', idx, 'down')} disabled={idx === milestones.length - 1} className="p-1 text-[#6b6f80] hover:text-white disabled:opacity-20 transition-colors">
                                                <ArrowDown size={14} />
                                            </button>
                                            <button onClick={() => removeMilestone(idx)} className="p-1 text-red-400/70 hover:text-red-400 transition-colors ml-1">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <div>
                                                <label className="admin-label">Year</label>
                                                <input type="text" value={item.year} onChange={(e) => updateMilestone(idx, 'year', e.target.value)} className="admin-input" placeholder="e.g. 2026" />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="admin-label">Title</label>
                                                <input type="text" value={item.title} onChange={(e) => updateMilestone(idx, 'title', e.target.value)} className="admin-input" placeholder="e.g. Series-A Funding" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="admin-label">Short Summary</label>
                                            <textarea value={item.desc} onChange={(e) => updateMilestone(idx, 'desc', e.target.value)} rows={2} className="admin-input resize-none !h-auto py-2" placeholder="Summary notes..." />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* RIGHT: Live Timeline preview pane */}
                <div className="lg:col-span-2 sticky top-20 stats-glass p-5 border border-white/5 rounded-2xl space-y-6">
                    <div className="flex items-center gap-1.5 text-xs text-[#8b8fa3] font-bold uppercase tracking-widest border-b border-white/5 pb-3">
                        <Eye size={14} className="text-[#34d99a]" /> About Page Live Preview
                    </div>

                    {/* USPs Preview */}
                    {activeSection === 'whyus' && (
                        <div className="space-y-4">
                            <p className="text-[10px] text-[#6b6f80] uppercase tracking-widest font-bold">Why Choose Us Grid</p>
                            <div className="relative border border-white/5 rounded-xl bg-[#08090d] p-4 overflow-hidden space-y-3 min-h-[200px]">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:10px_10px]" />
                                {whyUs.map((item, idx) => (
                                    <div key={idx} className="relative z-10 flex gap-3 p-2.5 rounded-lg border border-white/5 bg-[#0e0f14]/50">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#34d99a]/15 text-[#34d99a] shrink-0">
                                            <PreviewIcon name={item.icon} className="h-3.5 w-3.5" />
                                        </div>
                                        <div>
                                            <h4 className="text-[11px] font-extrabold text-white">{item.title || 'Usp Point'}</h4>
                                            <p className="text-[9px] text-[#8b8fa3] mt-0.5 leading-relaxed">{item.desc || 'Description text'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Culture Values Preview */}
                    {activeSection === 'values' && (
                        <div className="space-y-4">
                            <p className="text-[10px] text-[#6b6f80] uppercase tracking-widest font-bold">Team Values checklist</p>
                            <div className="relative border border-white/5 rounded-xl bg-[#08090d] p-4 overflow-hidden grid grid-cols-1 gap-2 min-h-[160px]">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:10px_10px]" />
                                {teamValues.filter(v => !!v.text.trim()).map((val, idx) => (
                                    <div key={idx} className="relative z-10 flex items-center gap-2 p-2 rounded-lg bg-white/[0.01] border border-white/[0.01] text-[10px] text-[#a0a3b1]">
                                        <Check size={12} className="text-[#34d99a]" />
                                        <span>{val.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Timeline Preview */}
                    {activeSection === 'milestones' && (
                        <div className="space-y-4">
                            <p className="text-[10px] text-[#6b6f80] uppercase tracking-widest font-bold">Milestones Timeline Preview</p>
                            <div className="relative border border-white/5 rounded-xl bg-[#08090d] p-6 overflow-hidden min-h-[300px]">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:10px_10px]" />
                                
                                {/* Vertical line */}
                                <div className="absolute left-[38px] top-6 bottom-6 w-0.5 bg-white/10" />

                                <div className="relative z-10 space-y-5">
                                    {milestones.map((ms, idx) => (
                                        <div key={idx} className="flex gap-4 items-start group">
                                            {/* Node year circle */}
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0b0f] border-2 border-[#34d99a]/30 text-[8px] text-[#34d99a] font-extrabold shrink-0 z-10 group-hover:border-[#34d99a] transition-all">
                                                {ms.year || '00'}
                                            </div>
                                            <div className="space-y-0.5 pt-1">
                                                <h4 className="text-[11px] font-black text-white">{ms.title || 'Milestone Title'}</h4>
                                                <p className="text-[9px] text-[#8b8fa3] leading-relaxed line-clamp-2">{ms.desc || 'Summary desc text'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}
