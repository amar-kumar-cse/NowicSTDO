import { api } from './api';

/**
 * Save a section's data to the site_content table.
 * Uses upsert so it inserts if missing, updates if exists.
 */
export async function saveSection(section, data, token) {
    await api.saveAdminSiteContent(token, section, data);
    return true;
}

/**
 * Fetch a single section from site_content.
 */
export async function fetchSection(section) {
    try {
        const response = await api.getSiteContentSection(section);
        return response?.data?.data ?? null;
    } catch (error) {
        if ((error?.message || '').toLowerCase().includes('not found')) {
            return null;
        }
        throw error;
    }
}
