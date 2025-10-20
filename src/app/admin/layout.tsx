import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createClient } from '../../lib/supabase/server';

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ログインしていない場合はログインページへ
  if (!session) {
    redirect('/auth/login?redirect_to=/admin');
  }

  // 環境変数から管理者メールアドレスを取得
  const adminEmail = process.env.ADMIN_EMAIL;

  // 管理者メールアドレスが設定されていない、または一致しない場合はトップページへ
  if (!adminEmail || session.user.email !== adminEmail) {
    redirect('/');
  }

  // 管理者であればページを表示
  return <>{children}</>;
};

export default AdminLayout;
