# Supabase連携手順（Admin）

## 1. 環境変数
`.env.local` に以下を設定してください。

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. SQL適用順
1. `/Users/kou/concrete-lab/megurid/admin_schema.sql`
2. `/Users/kou/concrete-lab/megurid/supabase/admin_integration.sql`

## 3. 管理者ユーザー初期化
Supabase Auth で管理者アカウントを作成後、`auth.users.id` を使って `admin_users` に投入:

```sql
INSERT INTO admin_users (auth_user_id, email, role, is_active)
VALUES ('<AUTH_USER_UUID>', 'admin@example.com', 'OWNER', true)
ON CONFLICT (auth_user_id)
DO UPDATE SET role = EXCLUDED.role, is_active = true;
```

## 4. 動作確認
- `/admin` が表示される
- `/api/admin/affiliates` が 401 ではなく 200/403 を返す
- `audit_logs` に更新履歴が入る

## 5. 既存スキーマ互換
`affiliates` が旧カラム（`default_rate_type`, `default_rate_value`, `active/inactive`）でも、
API側で自動吸収するように実装済みです。
