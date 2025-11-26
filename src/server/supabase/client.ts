import { createClient } from '@jsr/supabase__supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseServer = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (isSupabaseConfigured) {
    console.log('✅ Server: Supabase configured');
} else {
    console.warn('⚠️ Server: Supabase NOT configured');
}
