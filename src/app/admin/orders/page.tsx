import { unstable_noStore } from 'next/cache';
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from '@/lib/adminAuth';
import { AdminEnvNotice } from '@/app/admin/AdminEnvNotice';
import { getTableColumns } from '@/lib/admin/db';
import {
  formatOrderCurrency,
  formatOrderDate,
  getOrderStatusLabel,
  normalizeOrderAmount,
  ORDER_STATUS_OPTIONS,
} from '@/lib/orders';
import { updateOrderStatus } from '@/app/admin/orders/actions';

export const dynamic = 'force-dynamic';

function getShippingSummary(shippingAddress: any) {
  if (!shippingAddress) return { name: '-', address: '-', phone: '-' };

  const name = shippingAddress.name ?? shippingAddress.recipient ?? '-';
  const address = [
    shippingAddress.address?.postal_code ? `〒${shippingAddress.address.postal_code}` : null,
    shippingAddress.address?.state,
    shippingAddress.address?.city,
    shippingAddress.address?.line1,
    shippingAddress.address?.line2,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    name,
    address: address || '-',
    phone: shippingAddress.phone ?? shippingAddress.phone_number ?? '-',
  };
}

export default async function AdminOrdersPage() {
  unstable_noStore();
  if (!hasSupabaseAdminEnv()) return <AdminEnvNotice />;

  const db = getSupabaseAdminClient();
  let columns = new Set<string>();
  try {
    columns = await getTableColumns('orders');
  } catch (columnError) {
    console.error('[admin-orders] failed_to_load_columns', columnError);
  }
  const orderFields = [
    'id',
    'created_at',
    columns.has('updated_at') ? 'updated_at' : null,
    columns.has('customer_email') ? 'customer_email' : null,
    columns.has('total') ? 'total' : null,
    columns.has('currency') ? 'currency' : null,
    columns.has('status') ? 'status' : null,
    columns.has('shipping_address') ? 'shipping_address' : null,
  ]
    .filter(Boolean)
    .join(', ');
  const orderSelect = `
    ${orderFields},
    order_details (
      id,
      quantity,
      price,
      products (
        name
      )
    )
  `;

  const { data: orders, error } = await db
    .from('orders')
    .select(orderSelect)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[admin-orders] primary_query_failed', error);
  }

  let safeOrders: any[] = (orders as any[]) ?? [];

  if (error && safeOrders.length === 0) {
    const fallback = await db
      .from('orders')
      .select(`
        id,
        created_at,
        order_details (
          id,
          quantity,
          price,
          products (
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (fallback.error) {
      console.error('[admin-orders] fallback_query_failed', fallback.error);
    } else {
      safeOrders = (fallback.data as any[]) ?? [];
    }
  }
  const totalRevenue = safeOrders.reduce(
    (sum: number, order: any) => sum + normalizeOrderAmount(Number(order.total ?? 0), order.currency ?? 'jpy'),
    0,
  );
  const newOrders = safeOrders.filter((order: any) => order.status === 'completed').length;
  const processingOrders = safeOrders.filter((order: any) => order.status === 'processing').length;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order Management</h1>
          <p className="mt-1 text-sm text-stone-600">注文確認、対応状況の更新、配送先確認</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Recent Revenue</p>
            <p className="mt-2 text-xl font-semibold">{formatOrderCurrency(totalRevenue)}</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Open Orders</p>
            <p className="mt-2 text-xl font-semibold">{newOrders + processingOrders}</p>
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {safeOrders.map((order: any) => {
          const shipping = getShippingSummary(order.shipping_address);
          const items = order.order_details ?? [];

          return (
            <article key={order.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-stone-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Order</p>
                  <h2 className="font-semibold text-stone-900">{order.id}</h2>
                  <p className="text-sm text-stone-600">{formatOrderDate(order.created_at)}</p>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <span className="inline-flex rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white">
                    {getOrderStatusLabel(order.status)}
                  </span>
                  <p className="text-lg font-semibold">{formatOrderCurrency(normalizeOrderAmount(order.total, order.currency), order.currency)}</p>
                </div>
              </div>

              <div className="grid gap-5 pt-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <section>
                    <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Items</p>
                    <ul className="mt-2 space-y-2 text-sm text-stone-700">
                      {items.length > 0 ? (
                        items.map((item: any) => (
                          <li key={item.id} className="flex items-start justify-between gap-3 rounded-lg bg-stone-50 px-3 py-2">
                            <div>
                              <p className="font-medium text-stone-900">{item.products?.name ?? '商品名なし'}</p>
                              <p className="text-xs text-stone-500">数量 {item.quantity}</p>
                            </div>
                            <span>{formatOrderCurrency(normalizeOrderAmount(item.price, order.currency), order.currency)}</span>
                          </li>
                        ))
                      ) : (
                        <li className="rounded-lg bg-stone-50 px-3 py-2 text-stone-500">商品情報がありません</li>
                      )}
                    </ul>
                  </section>

                  <section>
                    <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Customer</p>
                    <div className="mt-2 rounded-lg bg-stone-50 px-3 py-3 text-sm text-stone-700">
                      <p className="font-medium text-stone-900">{shipping.name}</p>
                      <p className="mt-1 break-all">{order.customer_email ?? '-'}</p>
                      <p className="mt-1">{shipping.phone}</p>
                    </div>
                  </section>
                </div>

                <div className="space-y-4">
                  <section>
                    <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Shipping</p>
                    <div className="mt-2 rounded-lg bg-stone-50 px-3 py-3 text-sm text-stone-700">
                      <p className="whitespace-pre-line leading-6">{shipping.address}</p>
                      <p className="mt-3 border-t border-stone-200 pt-3">電話番号: {shipping.phone}</p>
                    </div>
                  </section>

                  <section>
                    <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Update Status</p>
                    <form action={updateOrderStatus} className="mt-2 space-y-2 rounded-lg border border-stone-200 p-3">
                      <input type="hidden" name="orderId" value={order.id} />
                      <select
                        name="status"
                        defaultValue={order.status ?? 'completed'}
                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                      >
                        {ORDER_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {getOrderStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="w-full rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
                      >
                        保存
                      </button>
                    </form>
                    <p className="mt-2 text-xs text-stone-500">最終更新: {formatOrderDate(order.updated_at ?? order.created_at)}</p>
                  </section>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!error && safeOrders.length === 0 && (
        <div className="rounded-lg border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-500">
          注文データはまだありません。
        </div>
      )}
    </div>
  );
}
