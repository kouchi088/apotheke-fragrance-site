import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { resolveAdminAccess } from '@/lib/adminAccess';
import {
  ADMIN_ACCESS_COOKIE_NAME,
  getAdminAccessCookieOptions,
  getBearerAccessToken,
} from '@/lib/adminAccessCookie';

export async function GET(req: NextRequest) {
  const accessToken = getBearerAccessToken(req.headers.get('authorization'));
  const result = await resolveAdminAccess(cookies(), { accessToken });

  const response = NextResponse.json({
    isAdmin: result.isAdmin,
    userEmail: result.userEmail,
  });

  if (accessToken && result.isAdmin) {
    response.cookies.set(ADMIN_ACCESS_COOKIE_NAME, accessToken, getAdminAccessCookieOptions());
  } else if (accessToken && !result.isAdmin) {
    response.cookies.set(ADMIN_ACCESS_COOKIE_NAME, '', {
      ...getAdminAccessCookieOptions(),
      maxAge: 0,
    });
  }

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ isAdmin: false });
  response.cookies.set(ADMIN_ACCESS_COOKIE_NAME, '', {
    ...getAdminAccessCookieOptions(),
    maxAge: 0,
  });

  return response;
}
