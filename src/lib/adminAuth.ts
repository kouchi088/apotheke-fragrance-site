import { createClient } from '@supabase/supabase-js';

export type AdminRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'ANALYST';

export type AdminAuthContext = {
  userId: string;
  email: string;
  role: AdminRole;
  adminId: string;
};

function logAdminAuth(event: string, details?: Record<string, unknown>) {
  const payload = details ? JSON.stringify(details) : '';
  console.info(`[admin-auth] ${event}${payload ? ` ${payload}` : ''}`);
}

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
  if (!authorizationHeader?.startsWith('Bearer ')) {
    logAdminAuth('missing_bearer_header');
    return null;
  }
  if (!hasSupabaseAdminEnv()) {
    logAdminAuth('missing_supabase_admin_env');
    return null;
  }

  const accessToken = authorizationHeader.slice('Bearer '.length).trim();
  if (!accessToken) {
    logAdminAuth('empty_access_token');
    return null;
  }

  const authed = getSupabaseAuthedClient(accessToken);
  if (!authed) {
    logAdminAuth('failed_to_create_authed_client');
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await authed.auth.getUser(accessToken);

  if (userError || !user) {
    logAdminAuth('token_user_lookup_failed', {
      message: userError?.message ?? 'No user returned',
    });
    return null;
  }

  const admin = getSupabaseAdminClient();
  const { data: adminUser, error: adminError } = await admin
    .from('admin_users')
    .select('id, email, role, is_active')
    .eq('auth_user_id', user.id)
    .single();

  if (adminError || !adminUser) {
    logAdminAuth('admin_user_lookup_failed', {
      authUserId: user.id,
      email: user.email ?? null,
      message: adminError?.message ?? 'No admin user returned',
      code: (adminError as any)?.code ?? null,
    });
    return null;
  }

  if (!adminUser.is_active) {
    logAdminAuth('admin_user_inactive', {
      authUserId: user.id,
      email: adminUser.email,
      adminId: adminUser.id,
    });
    return null;
  }

  logAdminAuth('admin_user_authenticated', {
    authUserId: user.id,
    email: adminUser.email,
    adminId: adminUser.id,
    role: adminUser.role,
  });

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
