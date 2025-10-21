import { cookies } from 'next/headers';
import type { ReactNode } from 'react';

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const cookieStore = cookies();
  const supabaseCookie = cookieStore.get('sb');

  console.log('--- Admin Layout Cookie Inspection ---');
  console.log('All cookies:', cookieStore.getAll());
  console.log('Value of "sb" cookie:', supabaseCookie);

  // No redirects for now, just render the page
  return <>{children}</>;
};

export default AdminLayout;
