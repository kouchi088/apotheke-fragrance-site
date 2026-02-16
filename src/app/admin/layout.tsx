import Link from 'next/link';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/affiliates', label: 'Affiliates' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/content/ugc', label: 'UGC' },
  { href: '/admin/content/blog', label: 'Blog' },
  { href: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
