import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { authenticateAdminFromBearer } from '@/lib/adminAuth';

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

export async function resolveAdminAccess(cookieStore: CookieReader) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const allowedAdminEmailRaw = process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const allowedAdminEmail = allowedAdminEmailRaw?.trim().toLowerCase();

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      isAdmin: false,
      user: null,
      userEmail: null,
    };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const token = cookieStore.get('admin_access_token')?.value ?? null;
  let userEmail = user?.email?.trim().toLowerCase() ?? null;
  let isAdmin = false;

  if (token) {
    const auth = await authenticateAdminFromBearer(`Bearer ${token}`);
    if (auth) {
      isAdmin = true;
      userEmail = auth.email.trim().toLowerCase();
    }
  }

  if (!isAdmin && token) {
    const { data: tokenUserRes } = await supabase.auth.getUser(token);
    const tokenUserEmail = tokenUserRes.user?.email?.trim().toLowerCase();
    if (tokenUserEmail) {
      userEmail = tokenUserEmail;
    }
  }

  if (!isAdmin && serviceRoleKey && (user || userEmail)) {
    const admin = createClient(supabaseUrl, serviceRoleKey);

    if (user) {
      const { data: adminUserById } = await admin
        .from('admin_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      isAdmin = Boolean(adminUserById);
    }

    if (!isAdmin && userEmail) {
      const { data: adminUserByEmail } = await admin
        .from('admin_users')
        .select('id')
        .eq('email', userEmail)
        .eq('is_active', true)
        .maybeSingle();
      isAdmin = Boolean(adminUserByEmail);
    }
  }

  if (!isAdmin && allowedAdminEmail && userEmail) {
    isAdmin = userEmail === allowedAdminEmail;
  }

  return {
    isAdmin,
    user,
    userEmail,
  };
}
