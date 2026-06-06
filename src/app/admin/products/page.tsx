import { getSupabaseAdminClient, hasSupabaseAdminEnv } from '@/lib/adminAuth';
import { AdminEnvNotice } from '@/app/admin/AdminEnvNotice';
import { revalidatePath, unstable_noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

async function updateNewArrivalStatus(formData: FormData) {
  'use server';
  if (!hasSupabaseAdminEnv()) return;

  const id = String(formData.get('id') || '');
  const isNewArrival = String(formData.get('is_new_arrival') || '') === 'true';
  if (!id) return;

  const db = getSupabaseAdminClient();
  await db
    .from('products')
    .update({
      is_new_arrival: isNewArrival,
    })
    .eq('id', id);

  revalidatePath('/admin/products');
  revalidatePath('/');
}

export default async function AdminProductsPage() {
  unstable_noStore();
  if (!hasSupabaseAdminEnv()) return <AdminEnvNotice />;
  const db = getSupabaseAdminClient();
  let hasNewArrivalColumn = true;
  let data: any[] | null = null;
  let error: any = null;

  ({ data, error } = await db
    .from('products')
    .select('id, name, slug, price, is_published, is_new_arrival, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100));
  if (error?.code === '42703') {
    ({ data, error } = await db
      .from('products')
      .select('id, name, slug, price, is_published, is_new_arrival, created_at')
      .order('created_at', { ascending: false })
      .limit(100));
  }
  if (error?.code === '42703') {
    hasNewArrivalColumn = false;
    ({ data, error } = await db
      .from('products')
      .select('id, name, slug, price, is_published')
      .limit(100));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Product Management</h1>
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </div>
      )}
      {!hasNewArrivalColumn && (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          New Arrivals を選択するには、Supabase SQL Editor で supabase/add_new_arrivals_selection_column.sql を実行してください。
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-100 text-left text-stone-600">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Published</th>
              <th className="px-3 py-2">New Arrivals</th>
              <th className="px-3 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row: any) => (
              <tr key={row.id} className="border-t border-stone-200">
                <td className="px-3 py-2 font-medium">{row.name}</td>
                <td className="px-3 py-2">{row.slug}</td>
                <td className="px-3 py-2">¥{Number(row.price).toLocaleString('ja-JP')}</td>
                <td className="px-3 py-2">{row.is_published ? 'Yes' : 'No'}</td>
                <td className="px-3 py-2">
                  {hasNewArrivalColumn ? (
                    <form action={updateNewArrivalStatus}>
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="is_new_arrival" value={row.is_new_arrival ? 'false' : 'true'} />
                      <button
                        className={`rounded border px-2 py-1 text-xs transition-colors ${
                          row.is_new_arrival
                            ? 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100'
                            : 'border-stone-300 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {row.is_new_arrival ? 'Selected' : 'Select'}
                      </button>
                    </form>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-3 py-2">
                  {row.updated_at
                    ? new Date(row.updated_at).toLocaleDateString('ja-JP')
                    : row.created_at
                      ? new Date(row.created_at).toLocaleDateString('ja-JP')
                      : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
