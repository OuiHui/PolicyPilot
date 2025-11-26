import { createClient, type SupabaseClient } from '@jsr/supabase__supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
  : null;

// Log Supabase configuration status
if (isSupabaseConfigured) {
  console.log('✅ Supabase is configured and connected');
  console.log('📦 Storage buckets available: denials, policies');
} else {
  console.warn('⚠️ Supabase is NOT configured');
  console.warn('Files will be uploaded directly (limited to 4.5MB on Vercel)');
  console.warn('To enable large file uploads, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
}
