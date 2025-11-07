import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper function to create a Supabase client for the Edge Runtime
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or Service Role Key is not defined in environment variables.');
  }

  return createClient(supabaseUrl, supabaseKey);
};

// Helper function to hash strings (for anonymizing IP/UA)
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const affCode = url.searchParams.get('aff');

  // Initialize a response - it will be modified by auth and affiliate logic
  let response: NextResponse;

  // --- Affiliate Link Handling ---
  if (affCode) {
    console.log(`Affiliate code found: ${affCode}`);
    // Clean the URL by removing the 'aff' parameter for subsequent requests
    url.searchParams.delete('aff');
    response = NextResponse.redirect(url);

    // Set the cookie on the response
    response.cookies.set('aff_code', affCode, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httponly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    // Asynchronously track the click in the database
    const trackClick = async () => {
      try {
        const supabase = createSupabaseClient();
        const { data: link } = await supabase
          .from('affiliate_links')
          .select('id, affiliate_id')
          .eq('code', affCode)
          .single();

        if (link) {
          const ip = req.ip ?? 'unknown';
          const ua = req.headers.get('user-agent') ?? 'unknown';
          const ip_hash = await sha256(ip);
          const ua_hash = await sha256(ua);

          await supabase.from('affiliate_clicks').insert({
            link_id: link.id,
            affiliate_id: link.affiliate_id,
            ip_hash,
            ua_hash,
          });
          console.log(`Tracked click for affiliate code: ${affCode}`);
        }
      } catch (error) {
        console.error('Error tracking affiliate click:', error);
      }
    };

    // In Edge functions, `waitUntil` is used to run promises without blocking the response
    (req as any).waitUntil(trackClick());

  } else {
    // If no affiliate code, prepare a standard response to pass to the auth check
    response = NextResponse.next();
  }

  // --- Basic Auth Handling ---
  console.log('--- Middleware Executing ---');
  const isBuildProcess = process.env.CI === 'true' || process.env.VERCEL === 'true';
  const isAuthDisabled = process.env.BASIC_AUTH_ENABLED !== 'true';

  if (isBuildProcess || isAuthDisabled) {
    console.log('Skipping Basic Auth.');
    return response; // Return the response (which may have affiliate cookie)
  }

  console.log('Executing Basic Auth Check...');
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    if (user === process.env.BASIC_AUTH_USER && pwd === process.env.BASIC_AUTH_PASSWORD) {
      console.log('Basic Auth Success.');
      return response; // Return the response (which may have affiliate cookie)
    }
  }

  console.log('Basic Auth Failed. Sending 401.');
  const authResponse = new Response('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });

  // If affiliate cookie was set, we need to transfer it to the auth response
  if (response.headers.get('set-cookie')) {
    authResponse.headers.set('set-cookie', response.headers.get('set-cookie')!);
  }

  return authResponse;
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
