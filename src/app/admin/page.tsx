import Link from 'next/link';
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from '@/lib/adminAuth';
import { AdminEnvNotice } from '@/app/admin/AdminEnvNotice';
import { formatOrderCurrency, getOrderStatusLabel, normalizeOrderAmount } from '@/lib/orders';

function formatYen(value: number) {
  return `¥${Math.round(value).toLocaleString('ja-JP')}`;
}

export default async function AdminDashboardPage() {
  if (!hasSupabaseAdminEnv()) return <AdminEnvNotice />;
  const db = getSupabaseAdminClient();

  const [clicks, commissions, affiliates, products, ugcPending, blogs, orders] = await Promise.all([
    db.from('affiliate_clicks').select('id', { count: 'exact', head: true }),
    db.from('affiliate_commissions').select('commission_amount'),
    db.from('affiliates').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    db.from('products').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    db.from('ugc_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('blog_posts').select('id', { count: 'exact', head: true }),
    db.from('orders').select('id, total, currency, status, created_at, customer_email').order('created_at', { ascending: false }).limit(6),
  ]);

  const totalCommission = (commissions.data ?? []).reduce((sum, item: any) => sum + Number(item.commission_amount ?? 0), 0);
  const ordersData = orders.data ?? [];
  const orderRevenue = ordersData.reduce(
    (sum, order: any) => sum + normalizeOrderAmount(Number(order.total ?? 0), order.currency ?? 'jpy'),
    0,
  );
  const openOrders = ordersData.filter((order: any) => ['completed', 'processing'].includes(order.status)).length;

  const cards = [
    { label: 'Recent Orders', value: ordersData.length.toLocaleString('ja-JP') },
    { label: 'Order Revenue', value: formatOrderCurrency(orderRevenue) },
    { label: 'Open Orders', value: openOrders.toLocaleString('ja-JP') },
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

      <section className="rounded-xl border border-stone-200">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <div>
            <h2 className="font-semibold">Recent Orders</h2>
            <p className="text-sm text-stone-500">新しく入った注文をすぐ確認できます</p>
          </div>
          <Link href="/admin/orders" className="text-sm font-medium text-stone-700 underline underline-offset-4">
            すべて見る
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-stone-100 text-left text-stone-600">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {ordersData.length > 0 ? (
                ordersData.map((order: any) => (
                  <tr key={order.id} className="border-t border-stone-200">
                    <td className="px-4 py-3 text-stone-600">
                      {new Date(order.created_at).toLocaleString('ja-JP', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-900">{order.customer_email ?? '-'}</p>
                      <p className="text-xs text-stone-500">{order.id}</p>
                    </td>
                    <td className="px-4 py-3">{getOrderStatusLabel(order.status)}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatOrderCurrency(normalizeOrderAmount(order.total, order.currency), order.currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-stone-500">
                    まだ注文はありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
