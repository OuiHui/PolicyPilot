import { createClient } from '@supabase/supabase-js';

// Check for both VITE_ prefixed (for local dev) and non-prefixed (for Vercel serverless) env vars
const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseServer = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (isSupabaseConfigured) {
    console.log('✅ Server: Supabase configured');
} else {
    console.warn('⚠️ Server: Supabase NOT configured - missing SUPABASE_URL or SUPABASE_ANON_KEY');
}

