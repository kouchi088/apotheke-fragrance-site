import { getSupabaseAdminClient, hasSupabaseAdminEnv } from '@/lib/adminAuth';
import { AdminEnvNotice } from '@/app/admin/AdminEnvNotice';

export default async function AdminProductsPage() {
  if (!hasSupabaseAdminEnv()) return <AdminEnvNotice />;
  const db = getSupabaseAdminClient();
  const { data } = await db
    .from('products')
    .select('id, name, slug, price, is_published, updated_at')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Product Management</h1>
      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-100 text-left text-stone-600">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Published</th>
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
                <td className="px-3 py-2">{new Date(row.updated_at).toLocaleDateString('ja-JP')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
