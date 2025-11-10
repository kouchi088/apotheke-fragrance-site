import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

// Helper to create a Supabase admin client for server-side operations
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase URL or Service Role Key is missing from environment variables.');
  }
  return createClient(supabaseUrl, serviceKey);
};

// Server Action to create a new affiliate link
async function createLinkAction(formData: FormData) {
  'use server';

  const supabase = getSupabaseAdmin();
  const code = formData.get('code') as string;
  const landingUrl = formData.get('landing_url') as string;
  const affiliateId = formData.get('affiliate_id') as string;

  if (!code || !affiliateId) {
    console.error('Code or Affiliate ID is missing.');
    return { error: 'Code or Affiliate ID is missing.' };
  }

  const { error } = await supabase.from('affiliate_links').insert({
    affiliate_id: affiliateId,
    code: code,
    landing_url: landingUrl || '/',
  });

  if (error) {
    console.error('Error creating affiliate link:', error);
    // Consider returning a more user-friendly error message
    return { error: error.message };
  }

  revalidatePath(`/admin/affiliates/${affiliateId}`);
  return { error: null };
}

export default async function AffiliateDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  const affiliateId = params.id;

  const { data: affiliate, error: affiliateError } = await supabase
    .from('affiliates')
    .select('*')
    .eq('id', affiliateId)
    .single();

  if (affiliateError || !affiliate) {
    notFound();
  }

  const { data: links, error: linksError } = await supabase
    .from('affiliate_links')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('created_at', { ascending: false });

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-site.com';

  return (
    <div className="p-6 sm:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-blue-600 hover:underline">&larr; 管理ダッシュボードに戻る</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{affiliate.name}</h1>
          <p className="text-gray-600">{affiliate.email}</p>
          <div className="mt-4 text-sm">
            <span className="font-semibold">報酬設定:</span>
            <span>
              {affiliate.default_rate_type === 'percentage'
                ? ` ${affiliate.default_rate_value * 100}%`
                : ` ¥${affiliate.default_rate_value.toLocaleString()}`}
            </span>
            <span className={`ml-4 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${affiliate.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {affiliate.status}
            </span>
          </div>
        </div>

        {/* Create New Link Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">新しいリンクを発行</h2>
          <form action={createLinkAction} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <input type="hidden" name="affiliate_id" value={affiliate.id} />
            <div className="md:col-span-1">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">紹介コード (URL用)</label>
              <input
                id="code"
                name="code"
                type="text"
                required
                placeholder="e.g., friend10"
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="landing_url" className="block text-sm font-medium text-gray-700">誘導先URL (任意)</label>
              <input
                id="landing_url"
                name="landing_url"
                type="text"
                placeholder="e.g., /products/some-product"
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-1">
              <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                リンク発行
              </button>
            </div>
          </form>
        </div>

        {/* Existing Links List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">発行済みリンク一覧</h2>
          <div className="overflow-x-auto">
            {links && links.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">アフィリエイトリンク</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">誘導先</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">発行日</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {links.map(link => (
                    <tr key={link.id}>
                      <td className="px-4 py-4 whitespace-nowrap font-mono bg-gray-50 rounded-md">{`${siteUrl}/?aff=${link.code}`}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-600">{link.landing_url}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-500">{new Date(link.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500 py-8">まだ発行されたリンクはありません。</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
