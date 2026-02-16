export function AdminEnvNotice() {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
      <h2 className="text-base font-semibold">Admin設定エラー</h2>
      <p className="mt-1 text-sm">`SUPABASE_SERVICE_ROLE_KEY` または `NEXT_PUBLIC_SUPABASE_URL` が未設定です。`.env.local` を確認してください。</p>
    </div>
  );
}
