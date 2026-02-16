import { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/adminAuth';
import { fail, ok, parsePagination, requireAdmin } from '@/lib/admin/http';

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req, 'ADMIN');
  if ('error' in guard) return guard.error;

  try {
    const { from, to, page, limit } = parsePagination(req);
    const db = getSupabaseAdminClient();
    const { data, error, count } = await db
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) return fail('DB_ERROR', error.message, 500);
    return ok({ items: data ?? [], page, limit, total: count ?? 0 });
  } catch (e: any) {
    return fail('VALIDATION_ERROR', e.message, 400);
  }
}
