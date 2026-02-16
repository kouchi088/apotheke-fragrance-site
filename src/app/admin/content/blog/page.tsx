import { getSupabaseAdminClient, hasSupabaseAdminEnv } from '@/lib/adminAuth';
import { AdminEnvNotice } from '@/app/admin/AdminEnvNotice';

export default async function AdminBlogPage() {
  if (!hasSupabaseAdminEnv()) return <AdminEnvNotice />;
  const db = getSupabaseAdminClient();
  const { data } = await db
    .from('blog_posts')
    .select('id, title, slug, status, published_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Blog Management</h1>
      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-100 text-left text-stone-600">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Published</th>
              <th className="px-3 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row: any) => (
              <tr key={row.id} className="border-t border-stone-200">
                <td className="px-3 py-2 font-medium">{row.title}</td>
                <td className="px-3 py-2">{row.slug}</td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2">{row.published_at ? new Date(row.published_at).toLocaleDateString('ja-JP') : '-'}</td>
                <td className="px-3 py-2">{new Date(row.updated_at).toLocaleDateString('ja-JP')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
