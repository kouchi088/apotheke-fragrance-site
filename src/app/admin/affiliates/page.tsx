import Link from 'next/link';
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from '@/lib/adminAuth';
import { AdminEnvNotice } from '@/app/admin/AdminEnvNotice';

export default async function AdminAffiliatesPage() {
  if (!hasSupabaseAdminEnv()) return <AdminEnvNotice />;
  const db = getSupabaseAdminClient();
  const { data } = await db
    .from('affiliates')
    .select('id, name, email, code, status, commission_type, commission_value, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Affiliate Management</h1>
      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-100 text-left text-stone-600">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Commission</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Detail</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row: any) => (
              <tr key={row.id} className="border-t border-stone-200">
                <td className="px-3 py-2">
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-stone-500">{row.email}</p>
                </td>
                <td className="px-3 py-2">{row.code}</td>
                <td className="px-3 py-2">
                  {row.commission_type === 'PERCENTAGE' ? `${row.commission_value}%` : `¥${row.commission_value}`}
                </td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2">
                  <Link href={`/admin/affiliates/${row.id}`} className="text-teal-700 underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
