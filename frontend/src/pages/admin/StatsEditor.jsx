import { useState, useEffect } from 'react';
import { Save, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useAuth } from '../../hooks/useAuth';
import { saveSection, fetchSection } from '../../lib/cms';

const ICON_OPTIONS = ['Gauge', 'Sparkles', 'Cpu', 'Layers', 'ShieldCheck', 'Users', 'Zap', 'Trophy', 'Star', 'Code2', 'Rocket', 'Bot'];

const normalizeIcon = (value, fallback) => {
    if (typeof value === 'string') return value;
    return value?.displayName || value?.name || fallback;
};

const normalizeItems = (list, fallbackIcon) => (Array.isArray(list) ? list : []).map((item) => ({
    ...item,
    icon: normalizeIcon(item.icon, fallbackIcon),
}));

export default function StatsEditor() {
    const { content = {}, refetch } = useContent();
    const { getApiToken } = useAuth();
    const defaultStats = content.stats || [];
    const defaultHighlights = content.highlights || [];
    const [stats, setStats] = useState([]);
    const [highlights, setHighlights] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        (async () => {
            const [statsResult, highlightsResult] = await Promise.allSettled([
                fetchSection('stats'),
                fetchSection('highlights'),
            ]);

            if (!mounted) return;

            const loadErrors = [];
            if (statsResult.status === 'rejected') {
                console.error('Failed to load stats:', statsResult.reason);
                loadErrors.push(`Failed to load stats: ${statsResult.reason?.message || String(statsResult.reason)}`);
            }
            if (highlightsResult.status === 'rejected') {
                console.error('Failed to load highlights:', highlightsResult.reason);
                loadErrors.push(`Failed to load highlights: ${highlightsResult.reason?.message || String(highlightsResult.reason)}`);
            }

            setStats(normalizeItems(statsResult.status === 'fulfilled' && statsResult.value ? statsResult.value : defaultStats, 'Gauge'));
            setHighlights(normalizeItems(highlightsResult.status === 'fulfilled' && highlightsResult.value ? highlightsResult.value : defaultHighlights, 'Zap'));
            setError(loadErrors.join(' | '));
        })().catch((err) => {
            console.error('Failed to load stats/highlights:', err);
            if (mounted) {
                setStats(normalizeItems(defaultStats, 'Gauge'));
                setHighlights(normalizeItems(defaultHighlights, 'Zap'));
                setError('Unable to load stats or highlights. Using defaults.');
            }
        });

        return () => {
            mounted = false;
        };
    }, [defaultStats, defaultHighlights]);

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

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await getApiToken();
            await Promise.all([
                saveSection('stats', stats, token),
                saveSection('highlights', highlights, token),
            ]);
            await refetch();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
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
                    <h1 className="text-2xl font-bold text-[#f0f0f3]">Stats & Highlights</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">Key metrics shown across the site.</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="admin-save-btn">
                    {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving...' : 'Save'}</>}
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                    {error}
                </div>
            )}

            {/* Highlights */}
            <h2 className="text-sm font-bold text-[#34d99a] uppercase tracking-wider mb-3">Highlights (Stats Bar)</h2>
            <div className="space-y-3 mb-8">
                {highlights.map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-[#1e2028] bg-[#0e0f14] p-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                                <label htmlFor={`highlight-icon-${idx}`} className="admin-label">Icon</label>
                                <select id={`highlight-icon-${idx}`} value={item.icon} onChange={(e) => updateHighlight(idx, 'icon', e.target.value)} className="admin-input">
                                    {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor={`highlight-value-${idx}`} className="admin-label">Value</label>
                                <input id={`highlight-value-${idx}`} type="text" value={item.value} onChange={(e) => updateHighlight(idx, 'value', e.target.value)} className="admin-input" />
                            </div>
                            <div>
                                <label htmlFor={`highlight-label-${idx}`} className="admin-label">Label</label>
                                <input id={`highlight-label-${idx}`} type="text" value={item.label} onChange={(e) => updateHighlight(idx, 'label', e.target.value)} className="admin-input" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stats */}
            <h2 className="text-sm font-bold text-[#34d99a] uppercase tracking-wider mb-3">Stats (Details)</h2>
            <div className="space-y-3">
                {stats.map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-[#1e2028] bg-[#0e0f14] p-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                                <label htmlFor={`stats-icon-${idx}`} className="admin-label">Icon</label>
                                <select id={`stats-icon-${idx}`} value={item.icon} onChange={(e) => updateStat(idx, 'icon', e.target.value)} className="admin-input">
                                    {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor={`stats-value-${idx}`} className="admin-label">Value</label>
                                <input id={`stats-value-${idx}`} type="text" value={item.value} onChange={(e) => updateStat(idx, 'value', e.target.value)} className="admin-input" />
                            </div>
                            <div>
                                <label htmlFor={`stats-label-${idx}`} className="admin-label">Label</label>
                                <input id={`stats-label-${idx}`} type="text" value={item.label} onChange={(e) => updateStat(idx, 'label', e.target.value)} className="admin-input" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
