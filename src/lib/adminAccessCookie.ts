export const ADMIN_ACCESS_COOKIE_NAME = 'admin_access_token';

export function getBearerAccessToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader?.startsWith('Bearer ')) return null;

  const token = authorizationHeader.slice('Bearer '.length).trim();
  return token || null;
}

export function getAdminAccessCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60,
  };
}
