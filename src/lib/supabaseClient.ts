import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let browserClient: SupabaseClient | null = null;

export function createClient(options?: { global?: { headers?: { Authorization?: string } }, auth?: any, cookieOptions?: any }) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const cookieDomain = appUrl ? new URL(appUrl).hostname : undefined;

  const mergedOptions = {
    ...options,
    auth: {
      ...options?.auth,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      cookieOptions: cookieDomain ? {
        name: 'sb',
        domain: cookieDomain,
        path: '/',
        sameSite: 'Lax',
        secure: true,
      } : undefined,
    },
  };

  if (typeof window !== 'undefined' && !options) {
    if (!browserClient) {
      browserClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, mergedOptions);
    }
    return browserClient;
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, mergedOptions);
}
