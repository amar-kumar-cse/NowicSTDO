import { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle2, Plus, Trash2, ArrowUp, ArrowDown, Image, Upload, Eye, HelpCircle, Bot, Building2, LayoutDashboard, Rocket, Gauge, ShieldCheck, Cpu, Layers, Sparkles, Code2, Globe, Zap, Trophy, Users, Star, Clock, Check } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useAuth } from '../../hooks/useAuth';
import { saveSection, fetchSection } from '../../lib/cms';
import { api, resolveImageUrl } from '../../lib/api';

const ICON_MAP = {
    Bot, Building2, LayoutDashboard, Rocket, Gauge, ShieldCheck,
    Cpu, Layers, Sparkles, Code2, Globe, Zap, Trophy, Users, Star
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

const emptyService = {
    id: '',
    icon: 'Rocket',
    title: '',
    headline: '',
    description: '',
    features: ['', '', ''],
    benefits: [],
    keyTech: [],
    faqs: [],
    price_starting: '',
    delivery_days: '',
    image_url: '',
    heroContent: { title: '', subtitle: '', description: '', image: { src: '', alt: '', hint: '' } },
    introduction: '',
    subServices: [],
    process: [],
    whyChooseUs: [],
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
    const [uploading, setUploading] = useState({});
    const [activePreviewIdx, setActivePreviewIdx] = useState(0);
    const timeoutRef = useRef(null);
    const fileInputRefs = useRef({});

    useEffect(() => {
        let mounted = true;

        const normalize = (list) => (list || []).map((s) => ({
            ...emptyService,
            ...s,
            id: s.id || createId(),
            icon: s.icon?.displayName || s.icon?.name || s.icon || 'Rocket',
            features: Array.isArray(s.features) ? s.features : (Array.isArray(s.features_list) ? s.features_list : []),
            benefits: Array.isArray(s.benefits) ? s.benefits : [],
            keyTech: Array.isArray(s.keyTech) ? s.keyTech : [],
            faqs: Array.isArray(s.faqs) ? s.faqs : [],
            subServices: Array.isArray(s.subServices) ? s.subServices : [],
            process: Array.isArray(s.process) ? s.process : [],
            whyChooseUs: Array.isArray(s.whyChooseUs) ? s.whyChooseUs : [],
            heroContent: s.heroContent || { title: '', subtitle: '', description: '', image: { src: '', alt: '', hint: '' } },
            introduction: s.introduction || '',
        }));

        (async () => {
            try {
                const data = await fetchSection('services');
                if (mounted) {
                    // Auto-heal logic: If the DB returns the 8 old incorrect services,
                    // we forcefully load the 6 correct defaultServices so the admin can save and overwrite the DB.
                    if (data && data.length === 8) {
                        setItems(normalize(defaultServices));
                    } else {
                        setItems(normalize(data || defaultServices));
                    }
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
    }, []);

    const update = (idx, field, value) => {
        setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
        setSaved(false);
    };

    const updateArrayField = (idx, field, itemIdx, value) => {
        setItems((prev) => prev.map((item, i) => {
            if (i !== idx) return item;
            const arr = [...(item[field] || [])];
            arr[itemIdx] = value;
            return { ...item, [field]: arr };
        }));
        setSaved(false);
    };

    const addArrayField = (idx, field, emptyValue = '') => {
        setItems((prev) => prev.map((item, i) => {
            if (i !== idx) return item;
            return { ...item, [field]: [...(item[field] || []), emptyValue] };
        }));
        setSaved(false);
    };

    const removeArrayField = (idx, field, itemIdx) => {
        setItems((prev) => prev.map((item, i) => {
            if (i !== idx) return item;
            return { ...item, [field]: (item[field] || []).filter((_, j) => j !== itemIdx) };
        }));
        setSaved(false);
    };

    const addItem = () => {
        const newService = { ...emptyService, id: createId(), features: ['', '', ''], benefits: [], keyTech: [], faqs: [], subServices: [], process: [], whyChooseUs: [] };
        setItems((prev) => [...prev, newService]);
        setActivePreviewIdx(items.length);
    };

    const removeItem = (idx) => {
        if (!confirm('Delete this service?')) return;
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
            const result = await api.admin_uploadMedia(token, file, 'services');
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

    const PreviewIcon = ({ name, className }) => {
        const IconComponent = ICON_MAP[name] || HelpCircle;
        return <IconComponent className={className} />;
    };

    const previewItem = items[activePreviewIdx];

    return (
        <div className="space-y-6 relative pb-10">
            
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3] tracking-tight">Services Offerings</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">{items.length} active service plans configured.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={addItem} className="admin-add-btn text-xs px-3 py-2 flex items-center gap-1">
                        <Plus size={14} /> Add Service
                    </button>
                    <button onClick={handleSave} disabled={saving} className="admin-save-btn text-xs px-4 py-2 flex items-center gap-1.5">
                        {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}</>}
                    </button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-5 items-start">
                
                {/* LEFT: Service list editor */}
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
                                    Service Plan #{idx + 1}
                                </span>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="admin-label">Title</label>
                                    <input type="text" value={item.title} onChange={(e) => update(idx, 'title', e.target.value)} className="admin-input" placeholder="Service title" />
                                </div>
                                <div>
                                    <label className="admin-label">Headline</label>
                                    <input type="text" value={item.headline} onChange={(e) => update(idx, 'headline', e.target.value)} className="admin-input" placeholder="Headline / Short catchphrase" />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="admin-label">Starting Price (INR)</label>
                                    <input type="number" value={item.price_starting || ''} onChange={(e) => update(idx, 'price_starting', e.target.value)} className="admin-input" placeholder="e.g. 50000" />
                                </div>
                                <div>
                                    <label className="admin-label">Delivery Timeline (Days)</label>
                                    <input type="number" value={item.delivery_days || ''} onChange={(e) => update(idx, 'delivery_days', e.target.value)} className="admin-input" placeholder="e.g. 14" />
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
                                                onClick={() => update(idx, 'icon', ic)}
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

                            <div>
                                <label className="admin-label">Description</label>
                                <textarea value={item.description} onChange={(e) => update(idx, 'description', e.target.value)} rows={3} className="admin-input resize-none !h-auto py-2" placeholder="Full service breakdown..." />
                            </div>

                            {/* Features */}
                            <div>
                                <label className="admin-label">Features Checklist</label>
                                <div className="space-y-2">
                                    {(item.features || []).map((f, fIdx) => (
                                        <div key={`feat-${fIdx}`} className="flex gap-2">
                                            <input type="text" value={f} onChange={(e) => updateArrayField(idx, 'features', fIdx, e.target.value)} className="admin-input flex-1" placeholder={`Feature ${fIdx + 1}`} />
                                            <button onClick={() => removeArrayField(idx, 'features', fIdx)} className="text-red-400 hover:text-red-300 px-2"><Trash2 size={12} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayField(idx, 'features')} className="text-xs text-[#34d99a] hover:underline">+ Add feature</button>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div>
                                <label className="admin-label">Benefits</label>
                                <div className="space-y-2">
                                    {(item.benefits || []).map((b, bIdx) => (
                                        <div key={`ben-${bIdx}`} className="flex gap-2">
                                            <input type="text" value={b} onChange={(e) => updateArrayField(idx, 'benefits', bIdx, e.target.value)} className="admin-input flex-1" placeholder={`Benefit ${bIdx + 1}`} />
                                            <button onClick={() => removeArrayField(idx, 'benefits', bIdx)} className="text-red-400 hover:text-red-300 px-2"><Trash2 size={12} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayField(idx, 'benefits')} className="text-xs text-[#34d99a] hover:underline">+ Add benefit</button>
                                </div>
                            </div>

                            {/* Key Tech Stack */}
                            <div>
                                <label className="admin-label">Key Tech Stack</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {(item.keyTech || []).map((tech, tIdx) => (
                                        <div key={`tech-${tIdx}`} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full pl-3 pr-1 py-1">
                                            <input type="text" value={tech} onChange={(e) => updateArrayField(idx, 'keyTech', tIdx, e.target.value)} className="bg-transparent text-xs text-white outline-none w-20" placeholder="e.g. React" />
                                            <button onClick={() => removeArrayField(idx, 'keyTech', tIdx)} className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-black/20"><Trash2 size={10} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayField(idx, 'keyTech')} className="text-xs bg-[#34d99a]/10 text-[#34d99a] border border-[#34d99a]/20 rounded-full px-3 py-1 hover:bg-[#34d99a]/20 transition-colors">+ Add Tech</button>
                                </div>
                            </div>

                            {/* FAQs */}
                            <div>
                                <label className="admin-label">FAQs (Specific to this service)</label>
                                <div className="space-y-3">
                                    {(item.faqs || []).map((faq, faqIdx) => (
                                        <div key={`faq-${faqIdx}`} className="relative bg-black/20 p-3 rounded-lg border border-white/5 space-y-2">
                                            <button onClick={() => removeArrayField(idx, 'faqs', faqIdx)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 p-1"><Trash2 size={12} /></button>
                                            <input type="text" value={faq.q} onChange={(e) => updateArrayField(idx, 'faqs', faqIdx, { ...faq, q: e.target.value })} className="admin-input text-sm" placeholder="Question" />
                                            <textarea value={faq.a} onChange={(e) => updateArrayField(idx, 'faqs', faqIdx, { ...faq, a: e.target.value })} rows={2} className="admin-input text-sm resize-none !h-auto py-2" placeholder="Answer" />
                                        </div>
                                    ))}
                                    <button onClick={() => addArrayField(idx, 'faqs', { q: '', a: '' })} className="text-xs text-[#34d99a] hover:underline">+ Add FAQ</button>
                                </div>
                            </div>

                            {/* Deep Content Editors */}
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <h3 className="text-sm font-bold text-[#f0f0f3]">Deep Page Content (Detailed View)</h3>
                                
                                <div>
                                    <label className="admin-label">Page Introduction</label>
                                    <textarea value={item.introduction || ''} onChange={(e) => update(idx, 'introduction', e.target.value)} rows={3} className="admin-input resize-none !h-auto py-2" placeholder="Intro text" />
                                </div>

                                <div>
                                    <label className="admin-label">Hero Details</label>
                                    <div className="grid gap-2 bg-black/20 p-3 rounded-lg border border-white/5">
                                        <input type="text" value={item.heroContent?.title || ''} onChange={(e) => update(idx, 'heroContent', { ...(item.heroContent || {}), title: e.target.value })} className="admin-input text-sm" placeholder="Hero Title" />
                                        <input type="text" value={item.heroContent?.subtitle || ''} onChange={(e) => update(idx, 'heroContent', { ...(item.heroContent || {}), subtitle: e.target.value })} className="admin-input text-sm" placeholder="Hero Subtitle" />
                                        <textarea value={item.heroContent?.description || ''} onChange={(e) => update(idx, 'heroContent', { ...(item.heroContent || {}), description: e.target.value })} rows={2} className="admin-input text-sm resize-none" placeholder="Hero Description" />
                                    </div>
                                </div>

                                {/* Process */}
                                <div>
                                    <label className="admin-label">Process Steps</label>
                                    <div className="space-y-3">
                                        {(item.process || []).map((step, pIdx) => (
                                            <div key={`proc-${pIdx}`} className="relative bg-black/20 p-3 rounded-lg border border-white/5 space-y-2">
                                                <button onClick={() => removeArrayField(idx, 'process', pIdx)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 p-1"><Trash2 size={12} /></button>
                                                <div className="flex gap-2">
                                                    <input type="text" value={step.step || ''} onChange={(e) => updateArrayField(idx, 'process', pIdx, { ...step, step: e.target.value })} className="admin-input w-16 text-sm" placeholder="No." />
                                                    <input type="text" value={step.title || ''} onChange={(e) => updateArrayField(idx, 'process', pIdx, { ...step, title: e.target.value })} className="admin-input flex-1 text-sm" placeholder="Step Title" />
                                                </div>
                                                <textarea value={step.description || ''} onChange={(e) => updateArrayField(idx, 'process', pIdx, { ...step, description: e.target.value })} rows={2} className="admin-input text-sm resize-none py-2" placeholder="Description" />
                                            </div>
                                        ))}
                                        <button onClick={() => addArrayField(idx, 'process', { step: '', title: '', description: '' })} className="text-xs text-[#34d99a] hover:underline">+ Add Step</button>
                                    </div>
                                </div>
                                
                                {/* Why Choose Us */}
                                <div>
                                    <label className="admin-label">Why Choose Us</label>
                                    <div className="space-y-3">
                                        {(item.whyChooseUs || []).map((wcu, wIdx) => (
                                            <div key={`wcu-${wIdx}`} className="relative bg-black/20 p-3 rounded-lg border border-white/5 space-y-2">
                                                <button onClick={() => removeArrayField(idx, 'whyChooseUs', wIdx)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 p-1"><Trash2 size={12} /></button>
                                                <div className="flex gap-2">
                                                    <input type="text" value={wcu.icon || ''} onChange={(e) => updateArrayField(idx, 'whyChooseUs', wIdx, { ...wcu, icon: e.target.value })} className="admin-input w-24 text-sm" placeholder="Icon Name" />
                                                    <input type="text" value={wcu.title || ''} onChange={(e) => updateArrayField(idx, 'whyChooseUs', wIdx, { ...wcu, title: e.target.value })} className="admin-input flex-1 text-sm" placeholder="Title" />
                                                </div>
                                                <textarea value={wcu.description || ''} onChange={(e) => updateArrayField(idx, 'whyChooseUs', wIdx, { ...wcu, description: e.target.value })} rows={2} className="admin-input text-sm resize-none py-2" placeholder="Description" />
                                            </div>
                                        ))}
                                        <button onClick={() => addArrayField(idx, 'whyChooseUs', { icon: 'Star', title: '', description: '' })} className="text-xs text-[#34d99a] hover:underline">+ Add Reason</button>
                                    </div>
                                </div>
                                
                                {/* Sub Services */}
                                <div>
                                    <label className="admin-label">Sub-Services / Modules</label>
                                    <div className="space-y-3">
                                        {(item.subServices || []).map((sub, sIdx) => (
                                            <div key={`sub-${sIdx}`} className="relative bg-black/20 p-3 rounded-lg border border-white/5 space-y-2">
                                                <button onClick={() => removeArrayField(idx, 'subServices', sIdx)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 p-1"><Trash2 size={12} /></button>
                                                <div className="flex gap-2 pr-6">
                                                    <input type="text" value={sub.icon || ''} onChange={(e) => updateArrayField(idx, 'subServices', sIdx, { ...sub, icon: e.target.value })} className="admin-input w-24 text-sm" placeholder="Icon Name" />
                                                    <input type="text" value={sub.title || ''} onChange={(e) => updateArrayField(idx, 'subServices', sIdx, { ...sub, title: e.target.value })} className="admin-input flex-1 text-sm" placeholder="Sub-Service Title" />
                                                </div>
                                                <textarea value={sub.description || ''} onChange={(e) => updateArrayField(idx, 'subServices', sIdx, { ...sub, description: e.target.value })} rows={2} className="admin-input text-sm resize-none py-2" placeholder="Description" />
                                                <div className="pt-2 border-t border-white/5">
                                                    <label className="text-[10px] text-[#8b8fa3] uppercase tracking-wider mb-1 block">Features</label>
                                                    <div className="space-y-1">
                                                        {(sub.features || []).map((sf, sfIdx) => (
                                                            <div key={`sf-${sfIdx}`} className="flex gap-2">
                                                                <input type="text" value={sf} onChange={(e) => {
                                                                    const newFeats = [...(sub.features || [])];
                                                                    newFeats[sfIdx] = e.target.value;
                                                                    updateArrayField(idx, 'subServices', sIdx, { ...sub, features: newFeats });
                                                                }} className="admin-input text-xs" />
                                                                <button onClick={() => {
                                                                    const newFeats = (sub.features || []).filter((_, j) => j !== sfIdx);
                                                                    updateArrayField(idx, 'subServices', sIdx, { ...sub, features: newFeats });
                                                                }} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={10} /></button>
                                                            </div>
                                                        ))}
                                                        <button onClick={() => {
                                                            const newFeats = [...(sub.features || []), ''];
                                                            updateArrayField(idx, 'subServices', sIdx, { ...sub, features: newFeats });
                                                        }} className="text-[10px] text-[#34d99a] hover:underline">+ Add Sub-Feature</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => addArrayField(idx, 'subServices', { title: '', description: '', icon: 'Code2', features: [] })} className="text-xs text-[#34d99a] hover:underline">+ Add Sub-Service</button>
                                    </div>
                                </div>
                            </div>

                            {/* Service Cover Image */}
                            <div>
                                <label className="admin-label flex items-center gap-1.5"><Image size={13} /> Service Cover Image</label>
                                <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start">
                                    {item.image_url ? (
                                        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-white/5 bg-[#15161b]">
                                            <img
                                                src={resolveImageUrl(item.image_url)}
                                                alt={item.title || 'Service'}
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
                                            placeholder="Paste image URL or upload below"
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

                {/* RIGHT: Live Service Card Preview */}
                <div className="lg:col-span-2 sticky top-20 stats-glass p-5 border border-white/5 rounded-2xl space-y-6">
                    <div className="flex items-center gap-1.5 text-xs text-[#8b8fa3] font-bold uppercase tracking-widest border-b border-white/5 pb-3">
                        <Eye size={14} className="text-[#34d99a]" /> Card Live Preview
                    </div>

                    {previewItem ? (
                        <div className="space-y-4">
                            <p className="text-[10px] text-[#6b6f80] uppercase tracking-widest font-bold">Active Card Mockup</p>
                            <div className="relative border border-white/5 rounded-2xl bg-[#08090d] p-6 overflow-hidden min-h-[300px]">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:10px_10px]" />
                                
                                <div className="relative z-10 flex justify-between items-start mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34d99a]/15 text-[#34d99a]">
                                        <PreviewIcon name={previewItem.icon} className="h-5 w-5" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-[#6b6f80] uppercase tracking-wider font-bold">Starting Price</p>
                                        <p className="text-lg font-black text-[#34d99a] leading-none mt-0.5">
                                            ₹{parseFloat(previewItem.price_starting || 0).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>

                                <div className="relative z-10 space-y-2 mb-4">
                                    <h3 className="text-sm font-extrabold text-white">{previewItem.title || 'Plan Title'}</h3>
                                    <p className="text-[10px] text-[#6b6f80] italic">"{previewItem.headline || 'Headline phrase'}"</p>
                                    <p className="text-[10px] text-[#8b8fa3] leading-relaxed line-clamp-3">{previewItem.description || 'Service description goes here'}</p>
                                </div>

                                <div className="relative z-10 border-t border-white/5 pt-4 space-y-2.5">
                                    <div className="flex items-center gap-1.5 text-[9px] text-[#6b6f80] font-bold uppercase tracking-wider mb-2">
                                        <Clock size={11} className="text-[#34d99a]" /> Est Delivery: {previewItem.delivery_days || '7'} Days
                                    </div>
                                    {previewItem.features.filter(f => !!f.trim()).map((feat, fIdx) => (
                                        <div key={fIdx} className="flex items-center gap-2 text-[10px] text-[#a0a3b1]">
                                            <Check size={12} className="text-[#34d99a] shrink-0" />
                                            <span className="truncate">{feat}</span>
                                        </div>
                                    ))}
                                </div>

                                {previewItem.image_url && (
                                    <div className="relative z-10 mt-5 h-24 w-full rounded-xl overflow-hidden border border-white/5">
                                        <img src={resolveImageUrl(previewItem.image_url)} alt="Cover Preview" className="h-full w-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-xs text-[#6b6f80] italic">Select a service plan card on the left to preview it visually.</div>
                    )}
                </div>

            </div>
        </div>
    );
}
