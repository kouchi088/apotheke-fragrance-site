import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { resolveAdminAccess } from '@/lib/adminAccess';

export async function GET() {
  const result = await resolveAdminAccess(cookies());

  return NextResponse.json({
    isAdmin: result.isAdmin,
    userEmail: result.userEmail,
  });
}
