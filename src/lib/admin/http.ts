import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthContext, AdminRole, authenticateAdminFromBearer, hasRequiredRole } from '@/lib/adminAuth';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(code: string, message: string, status: number, details?: unknown) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details,
      },
    },
    { status },
  );
}

export function parsePagination(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '20');

  if (!Number.isInteger(page) || page < 1) {
    throw new Error('page must be an integer >= 1');
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('limit must be an integer between 1 and 100');
  }

  return {
    page,
    limit,
    from: (page - 1) * limit,
    to: page * limit - 1,
  };
}

export async function requireAdmin(req: NextRequest, minimumRole: AdminRole = 'ANALYST') {
  const auth = await authenticateAdminFromBearer(req.headers.get('authorization'));
  if (!auth) {
    return { error: fail('UNAUTHORIZED', 'Authentication required', 401) } as const;
  }
  if (!hasRequiredRole(auth.role, minimumRole)) {
    return { error: fail('FORBIDDEN', 'Insufficient role', 403) } as const;
  }
  return { auth } as { auth: AdminAuthContext };
}

export function parseJsonSafely<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
