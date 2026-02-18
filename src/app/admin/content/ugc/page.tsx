import { getSupabaseAdminClient, hasSupabaseAdminEnv } from '@/lib/adminAuth';
import { AdminEnvNotice } from '@/app/admin/AdminEnvNotice';
import { revalidatePath } from 'next/cache';

async function updateSubmissionStatus(formData: FormData) {
  'use server';
  if (!hasSupabaseAdminEnv()) return;
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '');
  if (!id || !['pending', 'approved', 'rejected'].includes(status)) return;

  const db = getSupabaseAdminClient();
  await db
    .from('ugc_submissions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  revalidatePath('/admin/content/ugc');
  revalidatePath('/gallery');
}

export default async function AdminUgcPage() {
  if (!hasSupabaseAdminEnv()) return <AdminEnvNotice />;
  const db = getSupabaseAdminClient();
  const { data, error } = await db
    .from('ugc_submissions')
    .select('id, email, nickname, caption, status, created_at, product:products(name), images:ugc_images(id)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">UGC Management</h1>
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-100 text-left text-stone-600">
            <tr>
              <th className="px-3 py-2">Author</th>
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Caption</th>
              <th className="px-3 py-2">Images</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row: any) => (
              <tr key={row.id} className="border-t border-stone-200">
                <td className="px-3 py-2 font-medium">{row.nickname || row.email || 'Unknown'}</td>
                <td className="px-3 py-2">{row.product?.name ?? '-'}</td>
                <td className="px-3 py-2 max-w-[360px] truncate">{row.caption ?? '-'}</td>
                <td className="px-3 py-2">{row.images?.length ?? 0}</td>
                <td className="px-3 py-2">{row.status ?? 'pending'}</td>
                <td className="px-3 py-2">{new Date(row.created_at).toLocaleDateString('ja-JP')}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <form action={updateSubmissionStatus}>
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button className="rounded border border-green-600 px-2 py-1 text-xs text-green-700 hover:bg-green-50">
                        承認
                      </button>
                    </form>
                    <form action={updateSubmissionStatus}>
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button className="rounded border border-red-600 px-2 py-1 text-xs text-red-700 hover:bg-red-50">
                        却下
                      </button>
                    </form>
                    <form action={updateSubmissionStatus}>
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="status" value="pending" />
                      <button className="rounded border border-stone-400 px-2 py-1 text-xs text-stone-700 hover:bg-stone-50">
                        保留
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
