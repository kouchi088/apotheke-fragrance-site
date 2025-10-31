import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  console.log('--- Middleware Executing ---');
  console.log('CI:', process.env.CI);
  console.log('VERCEL:', process.env.VERCEL);
  console.log('BASIC_AUTH_ENABLED:', process.env.BASIC_AUTH_ENABLED);

  // Skip Basic Auth during Vercel's build process OR if it's disabled
  if (process.env.CI === 'true' || process.env.VERCEL === 'true' || process.env.BASIC_AUTH_ENABLED !== 'true') {
    console.log('Skipping Basic Auth.');
    return NextResponse.next();
  }

  console.log('Executing Basic Auth Check...');
  const basicAuth = req.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    // atob is available in the Edge Runtime
    const [user, pwd] = atob(authValue).split(':')

    if (user === process.env.BASIC_AUTH_USER && pwd === process.env.BASIC_AUTH_PASSWORD) {
      console.log('Basic Auth Success.');
      return NextResponse.next()
    }
  }

  console.log('Basic Auth Failed. Sending 401.');
  return new Response('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
