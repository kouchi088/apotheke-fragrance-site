import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { CopyableLink } from './CopyableLink';

// --- Type Definitions ---
type AffiliateLinkWithStats = {
  id: string;
  affiliate_id: string;
  code: string;
  landing_url: string;
  is_active: boolean;
  created_at: string;
  total_clicks: number;
  total_conversions: number;
  total_commission: number;
};

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
    return;
  }

  const { error } = await supabase.from('affiliate_links').insert({
    affiliate_id: affiliateId,
    code: code,
    landing_url: landingUrl || '/',
  });

  if (error) {
    console.error('Error creating affiliate link:', error);
    return;
  }

  revalidatePath(`/admin/affiliates/${affiliateId}`);
}

// The main page component is a Server Component
export default async function AffiliateDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  const affiliateId = params.id;

  // Fetch affiliate details
  const { data: affiliate, error: affiliateError } = await supabase
    .from('affiliates')
    .select('*')
    .eq('id', affiliateId)
    .single();

  if (affiliateError || !affiliate) {
    notFound();
  }

  // Fetch links with their stats using the new RPC and apply the type
  const { data: links, error: linksError } = await supabase
    .rpc<AffiliateLinkWithStats>('get_affiliate_links_with_stats', { p_affiliate_id: affiliateId });

  if (linksError) {
    console.error("Error fetching link stats:", linksError);
    // Handle error gracefully, maybe show a message
  }

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
                placeholder="/products/..."
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
          <div className="space-y-6">
            {links && links.length > 0 ? (
              links.map((link) => {
                const destination = new URL(link.landing_url || '/', siteUrl);
                destination.searchParams.set('aff', link.code);
                const finalUrl = destination.toString();

                return (
                  <div key={link.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">発行日: {new Date(link.created_at).toLocaleDateString()}</p>
                      <CopyableLink url={finalUrl} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Clicks</p>
                            <p className="text-2xl font-bold text-gray-800">{link.total_clicks}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Conversions</p>
                            <p className="text-2xl font-bold text-gray-800">{link.total_conversions}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Commission</p>
                            <p className="text-2xl font-bold text-gray-800">¥{Math.round(link.total_commission).toLocaleString()}</p>
                        </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-8">まだ発行されたリンクはありません。</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}