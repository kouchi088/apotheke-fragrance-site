import { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/adminAuth';
import { fail, ok, requireAdmin } from '@/lib/admin/http';

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req, 'ANALYST');
  if ('error' in guard) return guard.error;

  const db = getSupabaseAdminClient();
  const { data, error } = await db.from('system_settings').select('*').order('key', { ascending: true });
  if (error) return fail('DB_ERROR', error.message, 500);
  return ok(data ?? []);
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin(req, 'ADMIN');
  if ('error' in guard) return guard.error;

  try {
    const body = await req.json();
    const { key, value } = body;

    if (typeof key !== 'string' || !key.trim()) {
      return fail('VALIDATION_ERROR', 'key is required', 400, { field: 'key' });
    }

    const db = getSupabaseAdminClient();
    const { data: before } = await db.from('system_settings').select('*').eq('key', key).maybeSingle();

    const { data, error } = await db
      .from('system_settings')
      .upsert({ key, value, updated_by: guard.auth.adminId, updated_at: new Date().toISOString() })
      .select('*')
      .single();

    if (error) return fail('DB_ERROR', error.message, 500);

    await db.from('audit_logs').insert({
      actor_admin_id: guard.auth.adminId,
      actor_email: guard.auth.email,
      action: 'settings.update',
      entity_type: 'system_setting',
      entity_id: key,
      before_data: before,
      after_data: data,
    });

    return ok(data);
  } catch (e: any) {
    return fail('VALIDATION_ERROR', e.message, 400);
  }
}
