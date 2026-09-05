import { useState, useEffect } from 'react';
import { Save, CheckCircle2, Plus, Trash2, ArrowUp, ArrowDown, Database, Eye, Sparkles, HelpCircle, Bot, Building2, LayoutDashboard, Rocket, Gauge, ShieldCheck, Cpu, Layers, Code2, Globe, Zap, Trophy, Users, Star } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useAuth } from '../../hooks/useAuth';
import { saveSection, fetchSection } from '../../lib/cms';

const ICON_MAP = {
    Bot, Building2, LayoutDashboard, Rocket, Gauge, ShieldCheck,
    Cpu, Layers, Sparkles, Code2, Globe, Zap, Trophy, Users, Star
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

const normalizeIcon = (value, fallback) => {
    if (typeof value === 'string') return value;
    return value?.displayName || value?.name || fallback;
};

const normalizeItems = (list, fallbackIcon) => (Array.isArray(list) ? list : []).map((item) => ({
    ...item,
    icon: normalizeIcon(item.icon, fallbackIcon),
    link_type: item.link_type || 'manual', // manual | projects_delivered | happy_clients | services_offered | team_members
}));

export default function StatsEditor() {
    const { content = {}, refetch } = useContent();
    const { getApiToken } = useAuth();
    
    const defaultStats = content.stats || [];
    const defaultHighlights = content.highlights || [];
    
    const [stats, setStats] = useState([]);
    const [highlights, setHighlights] = useState([]);
    const [liveStats, setLiveStats] = useState({ projects_delivered: 0, happy_clients: 0, services_offered: 0, team_members: 0 });
    
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState('highlights'); // highlights | stats

    // Fetch site data and live backend database statistics
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                // Fetch CMS settings
                const [statsResult, highlightsResult, publicStatsResult] = await Promise.allSettled([
                    fetchSection('stats'),
                    fetchSection('highlights'),
                    fetch('/api/v1/public/stats/').then(r => r.json())
                ]);

                if (!mounted) return;

                const loadErrors = [];
                if (statsResult.status === 'rejected') {
                    console.error('Failed to load stats:', statsResult.reason);
                    loadErrors.push('Failed to load stats');
                }
                if (highlightsResult.status === 'rejected') {
                    console.error('Failed to load highlights:', highlightsResult.reason);
                    loadErrors.push('Failed to load highlights');
                }

                setStats(normalizeItems(statsResult.status === 'fulfilled' && statsResult.value ? statsResult.value : defaultStats, 'Gauge'));
                setHighlights(normalizeItems(highlightsResult.status === 'fulfilled' && highlightsResult.value ? highlightsResult.value : defaultHighlights, 'Zap'));
                
                if (publicStatsResult.status === 'fulfilled' && publicStatsResult.value?.success) {
                    setLiveStats(publicStatsResult.value.data);
                }

                if (loadErrors.length > 0) {
                    setError(loadErrors.join(' | '));
                }
            } catch (err) {
                console.error(err);
                if (mounted) setError('Error loading statistics configuration');
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const updateStat = (idx, field, value) => {
        setStats((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
        setSaved(false);
        setError('');
    };

    const updateHighlight = (idx, field, value) => {
        setHighlights((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
        setSaved(false);
        setError('');
    };

    const addHighlight = () => {
        setHighlights([...highlights, { icon: 'Zap', value: '10', label: 'New Highlight', link_type: 'manual' }]);
        setSaved(false);
    };

    const removeHighlight = (idx) => {
        setHighlights(highlights.filter((_, i) => i !== idx));
        setSaved(false);
    };

    const addStat = () => {
        setStats([...stats, { icon: 'Gauge', value: '25', label: 'New Stat', link_type: 'manual' }]);
        setSaved(false);
    };

    const removeStat = (idx) => {
        setStats(stats.filter((_, i) => i !== idx));
        setSaved(false);
    };

    const moveItem = (section, idx, direction) => {
        const list = section === 'highlights' ? [...highlights] : [...stats];
        const setList = section === 'highlights' ? setHighlights : setStats;
        
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
            await saveSection('stats', stats, token);
            await saveSection('highlights', highlights, token);
            
            await refetch();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err?.message || String(err) || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    // Component to render preview icon safely
    const PreviewIcon = ({ name, className }) => {
        const IconComponent = ICON_MAP[name] || HelpCircle;
        return <IconComponent className={className} />;
    };

    const resolveDisplayValue = (item) => {
        if (item.link_type && item.link_type !== 'manual') {
            return String(liveStats[item.link_type] || 0);
        }
        return item.value;
    };

    return (
        <div className="space-y-6 relative pb-10">
            
            {/* Header section */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3] tracking-tight">Stats & Highlights Manager</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">Link static highlights to database counts or override manual marketing numbers.</p>
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

            {/* Split layout: Editor on Left, Live Mockup Preview on Right */}
            <div className="grid gap-6 lg:grid-cols-5 items-start">
                
                {/* LEFT: Editors Panel */}
                <div className="lg:col-span-3 space-y-6">
                    
                    {/* Section Switcher Tabs */}
                    <div className="flex gap-2 bg-[#0e0f14]/80 border border-white/5 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveSection('highlights')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 ${
                                activeSection === 'highlights' 
                                    ? 'bg-[#34d99a]/10 text-[#34d99a] border border-[#34d99a]/20' 
                                    : 'text-[#8b8fa3] hover:text-white border border-transparent'
                            }`}
                        >
                            <Sparkles size={13} /> Stats Bar (Highlights)
                        </button>
                        <button
                            onClick={() => setActiveSection('stats')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 ${
                                activeSection === 'stats' 
                                    ? 'bg-[#34d99a]/10 text-[#34d99a] border border-[#34d99a]/20' 
                                    : 'text-[#8b8fa3] hover:text-white border border-transparent'
                            }`}
                        >
                            <Database size={13} /> Detailed Stats Block
                        </button>
                    </div>

                    {/* Highlights Editor */}
                    {activeSection === 'highlights' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#8b8fa3]">Stats Bar Rows</h3>
                                <button onClick={addHighlight} className="admin-add-btn text-xs px-3 py-1.5 flex items-center gap-1">
                                    <Plus size={13} /> Add Metric
                                </button>
                            </div>

                            <div className="space-y-4">
                                {highlights.map((item, idx) => (
                                    <div key={`hl-${idx}`} className="stats-glass p-5 border border-white/5 rounded-xl space-y-4 relative group">
                                        
                                        {/* Row controls */}
                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                            <button onClick={() => moveItem('highlights', idx, 'up')} disabled={idx === 0} className="p-1 text-[#6b6f80] hover:text-white disabled:opacity-20 transition-colors">
                                                <ArrowUp size={14} />
                                            </button>
                                            <button onClick={() => moveItem('highlights', idx, 'down')} disabled={idx === highlights.length - 1} className="p-1 text-[#6b6f80] hover:text-white disabled:opacity-20 transition-colors">
                                                <ArrowDown size={14} />
                                            </button>
                                            <button onClick={() => removeHighlight(idx)} className="p-1 text-red-400/70 hover:text-red-400 transition-colors ml-1">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {/* Label Input */}
                                            <div>
                                                <label className="admin-label">Metric Label</label>
                                                <input type="text" value={item.label} onChange={(e) => updateHighlight(idx, 'label', e.target.value)} className="admin-input" placeholder="e.g. Projects Delivered" />
                                            </div>

                                            {/* Link Type Selector */}
                                            <div>
                                                <label className="admin-label">Value Resolution</label>
                                                <select 
                                                    value={item.link_type} 
                                                    onChange={(e) => updateHighlight(idx, 'link_type', e.target.value)} 
                                                    className="admin-input"
                                                >
                                                    <option value="manual">Manual Override Value</option>
                                                    <option value="projects_delivered">Live DB: Projects Delivered Count ({liveStats.projects_delivered})</option>
                                                    <option value="happy_clients">Live DB: Happy Clients Count ({liveStats.happy_clients})</option>
                                                    <option value="services_offered">Live DB: Services Offered Count ({liveStats.services_offered})</option>
                                                    <option value="team_members">Live DB: Team Members Count ({liveStats.team_members})</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2 items-center">
                                            {/* Numeric input (only active if manual) */}
                                            <div>
                                                <label className="admin-label">Value</label>
                                                {item.link_type !== 'manual' ? (
                                                    <div className="admin-input flex items-center bg-[#0a0b0f]/50 border-white/5 text-[#6b6f80] gap-1.5 cursor-not-allowed select-none">
                                                        <Database size={12} className="text-[#34d99a]" /> Locked: {resolveDisplayValue(item)} (Database Value)
                                                    </div>
                                                ) : (
                                                    <input type="text" value={item.value} onChange={(e) => updateHighlight(idx, 'value', e.target.value)} className="admin-input" placeholder="e.g. 50+" />
                                                )}
                                            </div>

                                            {/* Icon grid picker */}
                                            <div>
                                                <label className="admin-label">Visual Icon Component</label>
                                                <div className="grid grid-cols-7 gap-1 border border-white/5 rounded-lg p-1 bg-black/40">
                                                    {ICON_OPTIONS.map((ic) => {
                                                        const IconComp = ICON_MAP[ic];
                                                        const isSelected = item.icon === ic;
                                                        return (
                                                            <button
                                                                key={ic}
                                                                type="button"
                                                                onClick={() => updateHighlight(idx, 'icon', ic)}
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

                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stats Editor */}
                    {activeSection === 'stats' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#8b8fa3]">Detailed Stats Rows</h3>
                                <button onClick={addStat} className="admin-add-btn text-xs px-3 py-1.5 flex items-center gap-1">
                                    <Plus size={13} /> Add Stat
                                </button>
                            </div>

                            <div className="space-y-4">
                                {stats.map((item, idx) => (
                                    <div key={`st-${idx}`} className="stats-glass p-5 border border-white/5 rounded-xl space-y-4 relative group">
                                        
                                        {/* Row controls */}
                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                            <button onClick={() => moveItem('stats', idx, 'up')} disabled={idx === 0} className="p-1 text-[#6b6f80] hover:text-white disabled:opacity-20 transition-colors">
                                                <ArrowUp size={14} />
                                            </button>
                                            <button onClick={() => moveItem('stats', idx, 'down')} disabled={idx === stats.length - 1} className="p-1 text-[#6b6f80] hover:text-white disabled:opacity-20 transition-colors">
                                                <ArrowDown size={14} />
                                            </button>
                                            <button onClick={() => removeStat(idx)} className="p-1 text-red-400/70 hover:text-red-400 transition-colors ml-1">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {/* Label Input */}
                                            <div>
                                                <label className="admin-label">Metric Label</label>
                                                <input type="text" value={item.label} onChange={(e) => updateStat(idx, 'label', e.target.value)} className="admin-input" placeholder="e.g. Clients World-wide" />
                                            </div>

                                            {/* Link Type Selector */}
                                            <div>
                                                <label className="admin-label">Value Resolution</label>
                                                <select 
                                                    value={item.link_type} 
                                                    onChange={(e) => updateStat(idx, 'link_type', e.target.value)} 
                                                    className="admin-input"
                                                >
                                                    <option value="manual">Manual Override Value</option>
                                                    <option value="projects_delivered">Live DB: Projects Delivered Count ({liveStats.projects_delivered})</option>
                                                    <option value="happy_clients">Live DB: Happy Clients Count ({liveStats.happy_clients})</option>
                                                    <option value="services_offered">Live DB: Services Offered Count ({liveStats.services_offered})</option>
                                                    <option value="team_members">Live DB: Team Members Count ({liveStats.team_members})</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2 items-center">
                                            {/* Numeric input (only active if manual) */}
                                            <div>
                                                <label className="admin-label">Value</label>
                                                {item.link_type !== 'manual' ? (
                                                    <div className="admin-input flex items-center bg-[#0a0b0f]/50 border-white/5 text-[#6b6f80] gap-1.5 cursor-not-allowed select-none">
                                                        <Database size={12} className="text-[#34d99a]" /> Locked: {resolveDisplayValue(item)} (Database Value)
                                                    </div>
                                                ) : (
                                                    <input type="text" value={item.value} onChange={(e) => updateStat(idx, 'value', e.target.value)} className="admin-input" placeholder="e.g. 99%" />
                                                )}
                                            </div>

                                            {/* Icon grid picker */}
                                            <div>
                                                <label className="admin-label">Visual Icon Component</label>
                                                <div className="grid grid-cols-7 gap-1 border border-white/5 rounded-lg p-1 bg-black/40">
                                                    {ICON_OPTIONS.map((ic) => {
                                                        const IconComp = ICON_MAP[ic];
                                                        const isSelected = item.icon === ic;
                                                        return (
                                                            <button
                                                                key={ic}
                                                                type="button"
                                                                onClick={() => updateStat(idx, 'icon', ic)}
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

                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* RIGHT: Visual Mockup Preview Pane */}
                <div className="lg:col-span-2 sticky top-20 stats-glass p-5 border border-white/5 rounded-2xl space-y-6">
                    <div className="flex items-center gap-1.5 text-xs text-[#8b8fa3] font-bold uppercase tracking-widest border-b border-white/5 pb-3">
                        <Eye size={14} className="text-[#34d99a]" /> Live Mockup Preview
                    </div>

                    {/* Stats Bar Preview */}
                    <div className="space-y-2">
                        <p className="text-[10px] text-[#6b6f80] uppercase tracking-widest font-bold">Homepage Highlights Bar</p>
                        <div className="relative border border-white/5 rounded-xl bg-[#08090d] p-4 overflow-hidden flex flex-wrap gap-4 items-center justify-around min-h-[80px]">
                            {/* Visual grid overlay */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px]" />
                            
                            {highlights.map((item, idx) => (
                                <div key={`prev-hl-${idx}`} className="relative z-10 flex items-center gap-2 p-2 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.01] rounded-lg transition-all">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34d99a]/10 text-[#34d99a]">
                                        <PreviewIcon name={item.icon} className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-extrabold text-[#f0f0f3] leading-none">{resolveDisplayValue(item)}</p>
                                        <p className="text-[9px] text-[#6b6f80] mt-0.5">{item.label || 'Label'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Stats Block Preview */}
                    <div className="space-y-2">
                        <p className="text-[10px] text-[#6b6f80] uppercase tracking-widest font-bold">Homepage Detailed Metrics Block</p>
                        <div className="relative border border-white/5 rounded-xl bg-[#08090d] p-4 overflow-hidden grid grid-cols-2 gap-3 min-h-[140px]">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px]" />
                            
                            {stats.map((item, idx) => (
                                <div key={`prev-st-${idx}`} className="relative z-10 p-3 rounded-xl border border-white/5 bg-[#0e0f14]/50 flex flex-col justify-between">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#34d99a]/15 text-[#34d99a] mb-2 w-fit">
                                        <PreviewIcon name={item.icon} className="h-3.5 w-3.5" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-white leading-tight">{resolveDisplayValue(item)}</p>
                                        <p className="text-[9px] text-[#8b8fa3] mt-0.5">{item.label || 'Metric description'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
