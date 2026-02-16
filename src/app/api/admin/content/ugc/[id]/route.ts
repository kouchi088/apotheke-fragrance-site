import { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/adminAuth';
import { fail, ok, requireAdmin } from '@/lib/admin/http';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(req, 'ANALYST');
  if ('error' in guard) return guard.error;

  const db = getSupabaseAdminClient();
  const { data, error } = await db.from('ugc_posts').select('*').eq('id', params.id).is('deleted_at', null).single();
  if (error || !data) return fail('NOT_FOUND', 'ugc post not found', 404);
  return ok(data);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(req, 'EDITOR');
  if ('error' in guard) return guard.error;

  const body = await req.json();
  const patch: Record<string, unknown> = {};
  for (const key of ['status', 'reject_reason', 'placement', 'priority']) {
    if (key in body) patch[key] = body[key];
  }
  patch.updated_at = new Date().toISOString();

  const db = getSupabaseAdminClient();
  const { data: before } = await db.from('ugc_posts').select('*').eq('id', params.id).single();
  const { data, error } = await db.from('ugc_posts').update(patch).eq('id', params.id).select('*').single();
  if (error || !data) return fail('DB_ERROR', error?.message ?? 'update failed', 500);

  await db.from('audit_logs').insert({
    actor_admin_id: guard.auth.adminId,
    actor_email: guard.auth.email,
    action: 'ugc.update',
    entity_type: 'ugc_post',
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
  const { data: before } = await db.from('ugc_posts').select('*').eq('id', params.id).single();
  const { error } = await db.from('ugc_posts').update({ deleted_at: new Date().toISOString() }).eq('id', params.id);
  if (error) return fail('DB_ERROR', error.message, 500);

  await db.from('audit_logs').insert({
    actor_admin_id: guard.auth.adminId,
    actor_email: guard.auth.email,
    action: 'ugc.delete',
    entity_type: 'ugc_post',
    entity_id: params.id,
    before_data: before,
  });

  return new Response(null, { status: 204 });
}
