import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This function is called in the background and does not block the response
async function trackAffiliateClick(req: NextRequest, affCode: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Middleware Error: Supabase environment variables are not set for affiliate tracking.');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: link } = await supabase
      .from('affiliate_links')
      .select('id, affiliate_id')
      .eq('code', affCode)
      .single();

    if (link) {
      const ip = req.ip ?? 'unknown';
      const ua = req.headers.get('user-agent') ?? 'unknown';
      
      // Anonymize IP and User Agent
      const encoder = new TextEncoder();
      const ipData = encoder.encode(ip);
      const uaData = encoder.encode(ua);
      const ipHashBuffer = await crypto.subtle.digest('SHA-256', ipData);
      const uaHashBuffer = await crypto.subtle.digest('SHA-256', uaData);
      const ip_hash = Array.from(new Uint8Array(ipHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      const ua_hash = Array.from(new Uint8Array(uaHashBuffer)).map(b => b.toString(16).padStart(2, '0').join('');

      await supabase.from('affiliate_clicks').insert({
        link_id: link.id,
        affiliate_id: link.affiliate_id,
        ip_hash,
        ua_hash,
      });
      console.log(`Tracked click for affiliate code: ${affCode}`);
    }
  } catch (error) {
    console.error('Error during background affiliate click tracking:', error);
  }
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const affCode = url.searchParams.get('aff');

  let response = NextResponse.next();

  // --- Affiliate Link Handling ---
  if (affCode) {
    console.log(`Affiliate code found: ${affCode}`);
    // Clean the URL by removing the 'aff' parameter for the redirect
    url.searchParams.delete('aff');
    response = NextResponse.redirect(url);

    // Set the cookie on the response
    response.cookies.set('aff_code', affCode, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    // Fire-and-forget the tracking function. Do NOT await it.
    trackAffiliateClick(req, affCode);
  }

  // --- Basic Auth Handling ---
  const isBuildProcess = process.env.CI === 'true' || process.env.VERCEL === 'true';
  const isAuthDisabled = process.env.BASIC_AUTH_ENABLED !== 'true';

  if (isBuildProcess || isAuthDisabled) {
    return response; // Return response, which may have the affiliate cookie
  }

  const basicAuth = req.headers.get('authorization');
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    if (user === process.env.BASIC_AUTH_USER && pwd === process.env.BASIC_AUTH_PASSWORD) {
      return response; // Return response, which may have the affiliate cookie
    }
  }

  // Auth failed, create a new 401 response
  const authResponse = new Response('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });

  // If an affiliate cookie was set, we need to transfer it to the auth response
  // because we are returning a completely new Response object.
  const cookie = response.headers.get('set-cookie');
  if (cookie) {
    authResponse.headers.set('set-cookie', cookie);
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