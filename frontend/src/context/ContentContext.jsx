import { createContext, useContext } from 'react';
import { api } from '../lib/api';

const ContentContext = createContext(null);

/* Icon map — we store icon *names* in DB, resolve to components here */
import {
    Bot, Building2, LayoutDashboard, Rocket, Gauge, ShieldCheck,
    Cpu, Layers, Sparkles, Code2, Globe, Zap, Trophy, Users, Star,
    Smartphone, TrendingUp, Palette,
} from 'lucide-react';

import { services as STATIC_SERVICES } from '../data/content';

const ICON_MAP = {
    Bot, Building2, LayoutDashboard, Rocket, Gauge, ShieldCheck,
    Cpu, Layers, Sparkles, Code2, Globe, Zap, Trophy, Users, Star,
    Smartphone, TrendingUp, Palette,
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

// Services are managed as static data in content.js — the single source of truth.
// This avoids inconsistencies caused by different DB environments on local vs Render.
function buildServices() {
    return STATIC_SERVICES.map((svc, idx) => ({
        ...svc,
        name: svc.name || svc.title || '',
        tagline: svc.tagline || svc.headline || '',
        icon_name: svc.icon_name || (typeof svc.icon === 'string' ? svc.icon : null) || 'Rocket',
        order: svc.order ?? idx,
    }));
}

import { useQuery } from '@tanstack/react-query';

export function ContentProvider({ children }) {
    const { data: content, isLoading: loading, refetch } = useQuery({
        queryKey: ['siteContent', 'v3'],
        queryFn: async () => {
            const [contentRes, statsRes, reviewsRes] = await Promise.allSettled([
                api.getSiteContent(),
                api.getStats(),
                api.public_getReviews(),
            ]);

            const rows = contentRes.status === 'fulfilled' ? (contentRes.value?.data || []) : [];
            const liveStats = statsRes.status === 'fulfilled' ? (statsRes.value?.data || {}) : {};
            const liveReviews = reviewsRes.status === 'fulfilled' ? (reviewsRes.value?.data || []) : [];

            const merged = { liveStats, reviews: liveReviews };
            rows.forEach((row) => {
                if (row.section && row.data !== undefined) {
                    // Skip services — we use static data as source of truth
                    if (row.section === 'services') return;
                    let val = row.data;
                    if (['stats', 'highlights', 'whyUs'].includes(row.section)) {
                        val = attachIcons(val);
                    }
                    merged[row.section] = val;
                }
            });

            // Services: always use the static content.js list as source of truth.
            // This guarantees consistent service names, slugs, and icons across
            // local and production regardless of which DB Render is pointing to.
            merged.services = buildServices();

            return merged;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    return (
        <ContentContext.Provider value={{ content: content || {}, loading, refetch }}>
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

