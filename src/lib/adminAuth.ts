import { createClient } from '@supabase/supabase-js';

export type AdminRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'ANALYST';

export type AdminAuthContext = {
  userId: string;
  email: string;
  role: AdminRole;
  adminId: string;
};

function getEnv(name: string): string | null {
  return process.env[name] ?? null;
}

export function hasSupabaseAdminEnv() {
  return Boolean(getEnv('NEXT_PUBLIC_SUPABASE_URL') && getEnv('SUPABASE_SERVICE_ROLE_KEY'));
}

export function getSupabaseAdminClient() {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key);
}

function getSupabaseAuthedClient(accessToken: string) {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anon = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !anon) return null;

  return createClient(url, anon, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export async function authenticateAdminFromBearer(authorizationHeader: string | null): Promise<AdminAuthContext | null> {
  if (!authorizationHeader?.startsWith('Bearer ')) return null;
  if (!hasSupabaseAdminEnv()) return null;

  const accessToken = authorizationHeader.slice('Bearer '.length).trim();
  if (!accessToken) return null;

  const authed = getSupabaseAuthedClient(accessToken);
  if (!authed) return null;

  const {
    data: { user },
    error: userError,
  } = await authed.auth.getUser();

  if (userError || !user) return null;

  const admin = getSupabaseAdminClient();
  const { data: adminUser, error: adminError } = await admin
    .from('admin_users')
    .select('id, email, role, is_active')
    .eq('auth_user_id', user.id)
    .single();

  if (adminError || !adminUser || !adminUser.is_active) return null;

  return {
    userId: user.id,
    email: adminUser.email,
    role: adminUser.role as AdminRole,
    adminId: adminUser.id,
  };
}

const roleWeights: Record<AdminRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  EDITOR: 2,
  ANALYST: 1,
};

export function hasRequiredRole(role: AdminRole, minimum: AdminRole): boolean {
  return roleWeights[role] >= roleWeights[minimum];
}
