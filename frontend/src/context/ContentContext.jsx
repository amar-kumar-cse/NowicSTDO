import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const ContentContext = createContext(null);

/* Icon map — we store icon *names* in DB, resolve to components here */
import {
    Bot, Building2, LayoutDashboard, Rocket, Gauge, ShieldCheck,
    Cpu, Layers, Sparkles, Code2, Globe, Zap, Trophy, Users, Star,
} from 'lucide-react';

const ICON_MAP = {
    Bot, Building2, LayoutDashboard, Rocket, Gauge, ShieldCheck,
    Cpu, Layers, Sparkles, Code2, Globe, Zap, Trophy, Users, Star,
};

function resolveIcon(name) {
    return ICON_MAP[name] || Rocket;
}

function attachIcons(items, iconField = 'icon') {
    if (!Array.isArray(items)) return items;
    return items.map((item) => ({
        ...item,
        [iconField]: typeof item[iconField] === 'string' ? resolveIcon(item[iconField]) : item[iconField],
    }));
}

export function ContentProvider({ children }) {
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchContent = async () => {
        try {
            const response = await api.getSiteContent();
            const rows = response?.data || [];

            setContent((prev) => {
                const merged = { ...prev };
                rows.forEach((row) => {
                    if (row.section && row.data !== undefined) {
                        let val = row.data;
                        if (['services', 'stats', 'highlights', 'whyUs'].includes(row.section)) {
                            val = attachIcons(val);
                        }
                        merged[row.section] = val;
                    }
                });
                return merged;
            });
        } catch (err) {
            console.warn('Content fetch failed, using defaults:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchContent(); }, []);

    return (
        <ContentContext.Provider value={{ content, loading, refetch: fetchContent }}>
            {children}
        </ContentContext.Provider>
    );
}

export function useContent() {
    const ctx = useContext(ContentContext);
    if (!ctx) {
        return { content: {}, loading: false, refetch: async () => {} };
    }
    return ctx;
}

export default ContentContext;
