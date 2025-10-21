import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createClient } from '../../lib/supabase/server';

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const supabase = createClient();

  console.log('--- Admin Layout Start ---');
  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log('Admin Layout found session for user:', session?.user?.id || 'No User');


  // ログインしていない場合はログインページへ
  if (!session) {
    console.log('Admin Layout: No session found, redirecting to login.');
    redirect('/auth/login?redirect_to=/admin');
  }

  // 環境変数から管理者メールアドレスを取得
  const adminEmail = process.env.ADMIN_EMAIL;

  // 管理者メールアドレスが設定されていない、または一致しない場合はトップページへ
  if (!adminEmail || session.user.email !== adminEmail) {
    console.log('Admin Layout: Admin check failed, redirecting to home.');
    redirect('/');
  }

  // 管理者であればページを表示
  console.log('Admin Layout: Admin check passed. Rendering page.');
  return <>{children}</>;
};

export default AdminLayout;
