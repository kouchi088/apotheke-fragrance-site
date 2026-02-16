import { getSupabaseAdminClient, hasSupabaseAdminEnv } from '@/lib/adminAuth';
import { AdminEnvNotice } from '@/app/admin/AdminEnvNotice';

export default async function AdminUgcPage() {
  if (!hasSupabaseAdminEnv()) return <AdminEnvNotice />;
  const db = getSupabaseAdminClient();
  const { data } = await db
    .from('ugc_posts')
    .select('id, author_name, status, placement, priority, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">UGC Management</h1>
      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-100 text-left text-stone-600">
            <tr>
              <th className="px-3 py-2">Author</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Placement</th>
              <th className="px-3 py-2">Priority</th>
              <th className="px-3 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row: any) => (
              <tr key={row.id} className="border-t border-stone-200">
                <td className="px-3 py-2 font-medium">{row.author_name ?? 'Unknown'}</td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2">{row.placement ?? '-'}</td>
                <td className="px-3 py-2">{row.priority}</td>
                <td className="px-3 py-2">{new Date(row.created_at).toLocaleDateString('ja-JP')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
