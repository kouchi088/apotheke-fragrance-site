import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { resolveAdminAccess } from '@/lib/adminAccess';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/orders', label: 'Orders' },
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

  if (!supabaseUrl || !supabaseAnonKey) {
    redirect('/auth/login');
  }

  const cookieStore = cookies();
  const { isAdmin, user, userEmail } = await resolveAdminAccess(cookieStore);

  console.info(
    `[admin-layout] start ${JSON.stringify({
      isProduction,
      hasServerUser: Boolean(user),
      hasTokenCookie: Boolean(cookieStore.get('admin_access_token')?.value),
      userEmail: userEmail ?? null,
      isAdmin,
    })}`,
  );

  if (!isAdmin && isProduction) {
    console.warn(
      `[admin-layout] denied ${JSON.stringify({
        hasServerUser: Boolean(user),
        email: userEmail ?? null,
        hasTokenCookie: Boolean(cookieStore.get('admin_access_token')?.value),
      })}`,
    );
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
