import { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle2, Eye, HelpCircle, Bot, Building2, LayoutDashboard, Rocket, Gauge, ShieldCheck, Cpu, Layers, Sparkles, Code2, Globe, Zap, Trophy, Users, Star, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useAuth } from '../../hooks/useAuth';
import { saveSection, fetchSection } from '../../lib/cms';

export default function BrandEditor() {
    const { content = {}, refetch } = useContent();
    const { getApiToken } = useAuth();
    const defaultBrand = content.brand || {};
    const [form, setForm] = useState({ ...defaultBrand });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const mountedRef = useRef(false);
    const defaultBrandRef = useRef(defaultBrand);
    const savedTimeoutRef = useRef(null);

    useEffect(() => {
        defaultBrandRef.current = defaultBrand;
    }, [defaultBrand]);

    useEffect(() => {
        mountedRef.current = true;

        (async () => {
            try {
                const data = await fetchSection('brand');
                if (mountedRef.current && data) {
                    setForm(data);
                    setError('');
                }
            } catch (err) {
                console.error('Failed to load brand settings:', err);
                if (mountedRef.current) {
                    setError('Unable to load brand settings. Using defaults.');
                    setForm({ ...defaultBrandRef.current });
                }
            }
        })();

        return () => {
            mountedRef.current = false;
            if (savedTimeoutRef.current) {
                clearTimeout(savedTimeoutRef.current);
            }
        };
    }, []);

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        setSaved(false);
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const token = await getApiToken();
            await saveSection('brand', form, token);
            await refetch();
            setSaved(true);
            if (savedTimeoutRef.current) {
                clearTimeout(savedTimeoutRef.current);
            }
            savedTimeoutRef.current = setTimeout(() => {
                if (mountedRef.current) {
                    setSaved(false);
                }
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to save brand settings');
        } finally {
            setSaving(false);
        }
    };

    const fields = [
        { name: 'name', label: 'Brand Name', placeholder: 'Nowic Studio' },
        { name: 'tagline', label: 'Tagline', placeholder: 'Vision to Version' },
        { name: 'email', label: 'Email', placeholder: 'hello@nowicstudio.com' },
        { name: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
        { name: 'location', label: 'Location', placeholder: 'India 🇮🇳' },
        { name: 'logoPrimary', label: 'Logo URL / Text', placeholder: 'NowicStudio' },
    ];

    return (
        <div className="space-y-6 relative pb-10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3] tracking-tight">Brand Settings</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">Edit your brand identity, logo texts, and primary contacts.</p>
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
                
                {/* Brand Inputs Form */}
                <div className="lg:col-span-3 stats-glass p-5 border border-white/5 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#8b8fa3] border-b border-white/5 pb-2">Identity Details</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {fields.map(({ name, label, placeholder }) => (
                            <div key={name}>
                                <label htmlFor={name} className="admin-label">{label}</label>
                                <input
                                    id={name}
                                    name={name}
                                    type="text"
                                    value={form[name] || ''}
                                    onChange={handleChange}
                                    placeholder={placeholder}
                                    className="admin-input"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navbar/Footer Mockup Preview */}
                <div className="lg:col-span-2 sticky top-20 stats-glass p-5 border border-white/5 rounded-2xl space-y-6">
                    <div className="flex items-center gap-1.5 text-xs text-[#8b8fa3] font-bold uppercase tracking-widest border-b border-white/5 pb-3">
                        <Eye size={14} className="text-[#34d99a]" /> Identity Live Preview
                    </div>

                    {/* Navbar Preview */}
                    <div className="space-y-2">
                        <p className="text-[10px] text-[#6b6f80] uppercase tracking-widest font-bold">Navbar Mockup</p>
                        <div className="relative border border-white/5 rounded-xl bg-[#08090d] p-3 overflow-hidden flex items-center justify-between min-h-[50px]">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:10px_10px]" />
                            <span className="relative z-10 text-xs font-black text-white tracking-wider flex items-center gap-1">
                                <Rocket size={12} className="text-[#34d99a]" />
                                {form.logoPrimary || form.name || 'NowicStudio'}
                            </span>
                            <div className="relative z-10 flex gap-2 text-[9px] text-[#8b8fa3] font-bold">
                                <span>Services</span>
                                <span>Portfolio</span>
                                <span className="text-[#34d99a]">Contact</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Preview */}
                    <div className="space-y-2">
                        <p className="text-[10px] text-[#6b6f80] uppercase tracking-widest font-bold">Footer Contacts Mockup</p>
                        <div className="relative border border-white/5 rounded-xl bg-[#08090d] p-4 overflow-hidden space-y-4">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:10px_10px]" />
                            
                            <div className="relative z-10 space-y-1">
                                <h4 className="text-xs font-black text-white">{form.name || 'Nowic Studio'}</h4>
                                <p className="text-[9px] text-[#6b6f80] italic">"{form.tagline || 'Vision to Version'}"</p>
                            </div>

                            <div className="relative z-10 space-y-2 text-[10px] text-[#8b8fa3] border-t border-white/5 pt-3">
                                <div className="flex items-center gap-2">
                                    <Mail size={12} className="text-[#34d99a] shrink-0" />
                                    <span className="truncate">{form.email || 'hello@nowicstudio.com'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={12} className="text-[#34d99a] shrink-0" />
                                    <span>{form.phone || '+91 88043 85786'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={12} className="text-[#34d99a] shrink-0" />
                                    <span>{form.location || 'India'}</span>
                                </div>
                            </div>

                            <p className="relative z-10 text-[8px] text-[#4a4e5e] text-center pt-2">
                                © 2026 {form.name || 'Nowic Studio'}. All rights reserved.
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
