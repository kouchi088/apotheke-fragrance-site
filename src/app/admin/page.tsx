import { getSupabaseAdminClient, hasSupabaseAdminEnv } from '@/lib/adminAuth';
import { AdminEnvNotice } from '@/app/admin/AdminEnvNotice';

function formatYen(value: number) {
  return `¥${Math.round(value).toLocaleString('ja-JP')}`;
}

export default async function AdminDashboardPage() {
  if (!hasSupabaseAdminEnv()) return <AdminEnvNotice />;
  const db = getSupabaseAdminClient();

  const [clicks, commissions, affiliates, products, ugcPending, blogs] = await Promise.all([
    db.from('affiliate_clicks').select('id', { count: 'exact', head: true }),
    db.from('affiliate_commissions').select('commission_amount'),
    db.from('affiliates').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    db.from('products').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    db.from('ugc_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('blog_posts').select('id', { count: 'exact', head: true }),
  ]);

  const totalCommission = (commissions.data ?? []).reduce((sum, item: any) => sum + Number(item.commission_amount ?? 0), 0);

  const cards = [
    { label: 'Affiliate Clicks', value: (clicks.count ?? 0).toLocaleString('ja-JP') },
    { label: 'Affiliate Revenue', value: formatYen(totalCommission) },
    { label: 'Affiliates', value: (affiliates.count ?? 0).toLocaleString('ja-JP') },
    { label: 'Products', value: (products.count ?? 0).toLocaleString('ja-JP') },
    { label: 'UGC Pending', value: (ugcPending.count ?? 0).toLocaleString('ja-JP') },
    { label: 'Blog Posts', value: (blogs.count ?? 0).toLocaleString('ja-JP') },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-600">アフィリエイト・商品・コンテンツ管理の概要</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
