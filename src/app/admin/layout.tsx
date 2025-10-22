import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createClient } from '../../lib/supabase/server';

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  console.log('\n\n--- ADMIN LAYOUT: NEW REQUEST ---');

  // Raw cookie check
  const cookieStore = cookies();
  console.log('Raw cookies visible to layout:', cookieStore.getAll());
  console.log('Raw "sb" cookie value:', cookieStore.get('sb')?.value || 'Not Found');

  // Supabase client check
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Supabase session object:', session);

  if (!session) {
    console.log('Redirect Reason: No session object.');
    redirect('/auth/login?redirect_to=/admin');
  }

  const adminEmailEnv = process.env.ADMIN_EMAIL;
  const userEmailSession = session.user.email;

  console.log(`Env ADMIN_EMAIL: "${adminEmailEnv}"`);
  console.log(`Session User Email: "${userEmailSession}"`);

  if (!adminEmailEnv) {
    console.log('Redirect Reason: ADMIN_EMAIL environment variable is not set.');
    redirect('/');
  }

  if (userEmailSession !== adminEmailEnv) {
    console.log(`Redirect Reason: Email mismatch. "${userEmailSession}" !== "${adminEmailEnv}"`);
    redirect('/');
  }

  console.log('All checks passed. Rendering admin page.');
  return <>{children}</>;
};

export default AdminLayout;
