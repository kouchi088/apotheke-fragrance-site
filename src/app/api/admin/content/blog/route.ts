import { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/adminAuth';
import { fail, ok, parsePagination, requireAdmin } from '@/lib/admin/http';
import { isSlug, requireString } from '@/lib/admin/validation';

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req, 'ANALYST');
  if ('error' in guard) return guard.error;

  try {
    const { from, to, page, limit } = parsePagination(req);
    const q = new URL(req.url).searchParams.get('q')?.trim();
    const db = getSupabaseAdminClient();

    let query = db
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(from, to);

    if (q) query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%`);

    const { data, error, count } = await query;
    if (error) return fail('DB_ERROR', error.message, 500);

    return ok({ items: data ?? [], page, limit, total: count ?? 0 });
  } catch (e: any) {
    return fail('VALIDATION_ERROR', e.message, 400);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req, 'EDITOR');
  if ('error' in guard) return guard.error;

  try {
    const body = await req.json();
    const title = requireString(body.title, 'title', 1, 120);
    const slug = requireString(body.slug, 'slug', 3, 80);
    if (!isSlug(slug)) return fail('VALIDATION_ERROR', 'invalid slug format', 400, { field: 'slug' });

    const db = getSupabaseAdminClient();
    const { data, error } = await db
      .from('blog_posts')
      .insert({
        title,
        slug,
        content_md: body.content_md ?? '',
        content_html: body.content_html ?? '',
        status: body.status ?? 'DRAFT',
        seo_title: body.seo_title ?? null,
        seo_description: body.seo_description ?? null,
        seo_canonical: body.seo_canonical ?? null,
        og_image_url: body.og_image_url ?? null,
        created_by: guard.auth.adminId,
        updated_by: guard.auth.adminId,
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') return fail('CONFLICT', 'slug already exists', 409, { field: 'slug' });
      return fail('DB_ERROR', error.message, 500);
    }

    await db.from('audit_logs').insert({
      actor_admin_id: guard.auth.adminId,
      actor_email: guard.auth.email,
      action: 'blog.create',
      entity_type: 'blog_post',
      entity_id: data.id,
      after_data: data,
    });

    return ok(data, 201);
  } catch (e: any) {
    return fail('VALIDATION_ERROR', e.message, 400);
  }
}
