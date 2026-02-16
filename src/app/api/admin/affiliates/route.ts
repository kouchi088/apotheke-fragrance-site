import { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/adminAuth';
import { fail, ok, parsePagination, requireAdmin } from '@/lib/admin/http';
import { isEmail, requireNumber, requireString } from '@/lib/admin/validation';
import { getTableColumns, pickExistingColumns } from '@/lib/admin/db';

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req, 'ANALYST');
  if ('error' in guard) return guard.error;

  try {
    const { from, to, page, limit } = parsePagination(req);
    const q = new URL(req.url).searchParams.get('q')?.trim();

    const db = getSupabaseAdminClient();
    let query = db
      .from('affiliates')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,code.ilike.%${q}%`);

    const { data, error, count } = await query;
    if (error) return fail('DB_ERROR', error.message, 500);

    return ok({ items: data ?? [], page, limit, total: count ?? 0 });
  } catch (e: any) {
    return fail('VALIDATION_ERROR', e.message, 400);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req, 'ADMIN');
  if ('error' in guard) return guard.error;

  try {
    const body = await req.json();
    const name = requireString(body.name, 'name', 1, 120);
    const email = requireString(body.email, 'email', 3, 254);
    const code = requireString(body.code, 'code', 3, 80);
    const commission_type = body.commission_type === 'FIXED' ? 'FIXED' : 'PERCENTAGE';
    const commission_value = requireNumber(body.commission_value, 'commission_value', 0);

    if (!isEmail(email)) return fail('VALIDATION_ERROR', 'invalid email', 400, { field: 'email' });
    if (commission_type === 'PERCENTAGE' && commission_value > 100) {
      return fail('VALIDATION_ERROR', 'commission_value must be <= 100 for percentage', 400, { field: 'commission_value' });
    }

    const db = getSupabaseAdminClient();
    const columns = await getTableColumns('affiliates');
    const payload = pickExistingColumns(
      {
        name,
        email,
        code,
        status: columns.has('status') && !columns.has('commission_type') ? 'active' : 'ACTIVE',
        commission_type,
        commission_value,
        default_rate_type: commission_type === 'PERCENTAGE' ? 'percentage' : 'fixed',
        default_rate_value: commission_type === 'PERCENTAGE' ? commission_value / 100 : commission_value,
      },
      columns,
    );

    const { data, error } = await db
      .from('affiliates')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') return fail('CONFLICT', 'affiliate code/email already exists', 409);
      return fail('DB_ERROR', error.message, 500);
    }

    await db.from('audit_logs').insert({
      actor_admin_id: guard.auth.adminId,
      actor_email: guard.auth.email,
      action: 'affiliate.create',
      entity_type: 'affiliate',
      entity_id: data.id,
      after_data: data,
    });

    return ok(data, 201);
  } catch (e: any) {
    return fail('VALIDATION_ERROR', e.message, 400);
  }
}
