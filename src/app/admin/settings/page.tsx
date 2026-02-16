import { getSupabaseAdminClient, hasSupabaseAdminEnv } from '@/lib/adminAuth';
import { AdminEnvNotice } from '@/app/admin/AdminEnvNotice';

export default async function AdminSettingsPage() {
  if (!hasSupabaseAdminEnv()) return <AdminEnvNotice />;
  const db = getSupabaseAdminClient();
  const [{ data: admins }, { data: settings }, { data: logs }] = await Promise.all([
    db.from('admin_users').select('id, email, role, is_active').order('email', { ascending: true }).limit(100),
    db.from('system_settings').select('key, value, updated_at').order('key', { ascending: true }).limit(100),
    db.from('audit_logs').select('id, action, actor_email, entity_type, created_at').order('created_at', { ascending: false }).limit(20),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-stone-600">ロール、システム設定、監査ログ</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Admin Roles</h2>
        <ul className="rounded-lg border border-stone-200 p-3 text-sm">
          {(admins ?? []).map((a: any) => (
            <li key={a.id} className="flex items-center justify-between border-b border-stone-100 py-2 last:border-b-0">
              <span>{a.email}</span>
              <span className="text-stone-600">{a.role} / {a.is_active ? 'active' : 'inactive'}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">System Settings</h2>
        <ul className="rounded-lg border border-stone-200 p-3 text-sm">
          {(settings ?? []).map((s: any) => (
            <li key={s.key} className="border-b border-stone-100 py-2 last:border-b-0">
              <p className="font-medium">{s.key}</p>
              <pre className="mt-1 overflow-x-auto rounded bg-stone-100 p-2 text-xs">{JSON.stringify(s.value, null, 2)}</pre>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Recent Audit Logs</h2>
        <ul className="rounded-lg border border-stone-200 p-3 text-sm">
          {(logs ?? []).map((l: any) => (
            <li key={l.id} className="border-b border-stone-100 py-2 last:border-b-0">
              <p className="font-medium">{l.action}</p>
              <p className="text-xs text-stone-500">{l.actor_email} / {l.entity_type} / {new Date(l.created_at).toLocaleString('ja-JP')}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
