import { createClient } from './lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  console.log(`--- Middleware Start for: ${request.nextUrl.pathname} ---`);
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Middleware found session for user:', session?.user?.id || 'No User');

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
