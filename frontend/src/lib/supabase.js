import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create client if valid URL is provided — prevents crash with placeholder values
let supabase = null;
try {
    if (supabaseUrl && supabaseUrl.startsWith('http')) {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
} catch (err) {
    console.warn('Supabase init failed:', err.message);
}

export default supabase;
