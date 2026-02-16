import { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/adminAuth';
import { fail, ok, requireAdmin } from '@/lib/admin/http';
import { getTableColumns, pickExistingColumns } from '@/lib/admin/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(req, 'ANALYST');
  if ('error' in guard) return guard.error;

  const db = getSupabaseAdminClient();
  const { data, error } = await db.from('affiliates').select('*').eq('id', params.id).is('deleted_at', null).single();
  if (error || !data) return fail('NOT_FOUND', 'affiliate not found', 404);
  return ok(data);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(req, 'ADMIN');
  if ('error' in guard) return guard.error;

  const body = await req.json();
  const patch: Record<string, unknown> = {};

  for (const key of ['name', 'email', 'status', 'commission_type', 'commission_value', 'note']) {
    if (key in body) patch[key] = body[key];
  }
  const columns = await getTableColumns('affiliates');
  const normalizedPatch = pickExistingColumns(
    {
      ...patch,
      updated_at: new Date().toISOString(),
      default_rate_type:
        body.commission_type === 'PERCENTAGE' ? 'percentage' : body.commission_type === 'FIXED' ? 'fixed' : undefined,
      default_rate_value:
        typeof body.commission_value === 'number'
          ? body.commission_type === 'PERCENTAGE'
            ? body.commission_value / 100
            : body.commission_value
          : undefined,
    },
    columns,
  );

  const db = getSupabaseAdminClient();
  const { data: before } = await db.from('affiliates').select('*').eq('id', params.id).single();
  const { data, error } = await db.from('affiliates').update(normalizedPatch).eq('id', params.id).select('*').single();

  if (error || !data) return fail('DB_ERROR', error?.message ?? 'update failed', 500);

  await db.from('audit_logs').insert({
    actor_admin_id: guard.auth.adminId,
    actor_email: guard.auth.email,
    action: 'affiliate.update',
    entity_type: 'affiliate',
    entity_id: params.id,
    before_data: before,
    after_data: data,
  });

  return ok(data);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(req, 'ADMIN');
  if ('error' in guard) return guard.error;

  const db = getSupabaseAdminClient();
  const { data: before } = await db.from('affiliates').select('*').eq('id', params.id).single();
  const columns = await getTableColumns('affiliates');
  const deletePatch = pickExistingColumns(
    {
      deleted_at: new Date().toISOString(),
      status: columns.has('status') && !columns.has('commission_type') ? 'inactive' : 'INACTIVE',
    },
    columns,
  );
  const { error } = await db.from('affiliates').update(deletePatch).eq('id', params.id);
  if (error) return fail('DB_ERROR', error.message, 500);

  await db.from('audit_logs').insert({
    actor_admin_id: guard.auth.adminId,
    actor_email: guard.auth.email,
    action: 'affiliate.delete',
    entity_type: 'affiliate',
    entity_id: params.id,
    before_data: before,
  });

  return new Response(null, { status: 204 });
}
