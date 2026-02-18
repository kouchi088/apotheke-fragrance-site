import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/affiliates', label: 'Affiliates' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/content/ugc', label: 'UGC' },
  { href: '/admin/content/blog', label: 'Blog' },
  { href: '/admin/settings', label: 'Settings' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isProduction = process.env.NODE_ENV === 'production';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const allowedAdminEmailRaw = process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const allowedAdminEmail = allowedAdminEmailRaw?.trim().toLowerCase();

  if (!supabaseUrl || !supabaseAnonKey) {
    redirect('/auth/login');
  }

  const cookieStore = cookies();
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

  if (!user && isProduction) {
    redirect('/auth/login');
  }

  let isAllowed = false;
  const userEmail = user?.email?.trim().toLowerCase();

  if (user && serviceRoleKey) {
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: adminUserById } = await admin
      .from('admin_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();
    isAllowed = Boolean(adminUserById);

    if (!isAllowed && userEmail) {
      const { data: adminUserByEmail } = await admin
        .from('admin_users')
        .select('id')
        .eq('email', userEmail)
        .eq('is_active', true)
        .maybeSingle();
      isAllowed = Boolean(adminUserByEmail);
    }
  }

  if (!isAllowed && allowedAdminEmail && userEmail) {
    isAllowed = userEmail === allowedAdminEmail;
  }

  if (!isAllowed && isProduction) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">MEGURID Admin</p>
          <nav className="space-y-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="block rounded-md px-3 py-2 text-sm hover:bg-stone-100">
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="rounded-xl border border-stone-200 bg-white p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
