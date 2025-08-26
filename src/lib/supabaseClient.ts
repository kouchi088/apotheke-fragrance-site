import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient(options?: { global: { headers: { Authorization: string } } }) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    ...options,
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    cookieOptions: {
      name: 'sb',
      domain: new URL(process.env.NEXT_PUBLIC_APP_URL!).hostname,
      path: '/',
      sameSite: 'Lax',
      secure: true,
    },
  });