import { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
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
            alert('Failed to save: ' + err.message);
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
        { name: 'logoPrimary', label: 'Logo URL', placeholder: '/image.png' },
    ];

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#f0f0f3]">Brand Settings</h1>
                    <p className="mt-1 text-sm text-[#6b6f80]">Edit your brand identity and contact info.</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="admin-save-btn">
                    {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}</>}
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                    {error}
                </div>
            )}

            <div className="rounded-xl border border-[#1e2028] bg-[#0e0f14] p-6 space-y-5">
                {fields.map((f) => (
                    <div key={f.name}>
                        <label htmlFor={`${f.name}-input`} className="admin-label">{f.label}</label>
                        <input
                            id={`${f.name}-input`}
                            type="text"
                            name={f.name}
                            value={form[f.name] || ''}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            className="admin-input"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
