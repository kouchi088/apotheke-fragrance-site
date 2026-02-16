import { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/adminAuth';
import { fail, ok, parsePagination, requireAdmin } from '@/lib/admin/http';

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req, 'ANALYST');
  if ('error' in guard) return guard.error;

  try {
    const { from, to, page, limit } = parsePagination(req);
    const status = new URL(req.url).searchParams.get('status');
    const db = getSupabaseAdminClient();

    let query = db
      .from('ugc_posts')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) return fail('DB_ERROR', error.message, 500);
    return ok({ items: data ?? [], page, limit, total: count ?? 0 });
  } catch (e: any) {
    return fail('VALIDATION_ERROR', e.message, 400);
  }
}
