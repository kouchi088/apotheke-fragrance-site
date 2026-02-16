import { createClient } from '@supabase/supabase-js';
import { SubmitReviewForm } from './SubmitReviewForm';

// This helper runs on the server to fetch data before rendering the page
const getSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Use anon key for public data

  if (!supabaseUrl || !supabaseKey) {
    // In a real app, you'd want to handle this more gracefully
    throw new Error('Supabase URL or Anon Key is not defined in environment variables.');
  }
  return createClient(supabaseUrl, supabaseKey);
};

export default async function SubmitReviewPage() {
  const supabase = getSupabaseServerClient();
  let { data: products, error } = await supabase
    .from('products')
    .select('id, name')
    .eq('is_published', true)
    .is('deleted_at', null)
    .order('name', { ascending: true });
  if (error?.code === '42703') {
    ({ data: products, error } = await supabase
      .from('products')
      .select('id, name')
      .eq('is_published', true)
      .order('name', { ascending: true }));
  }
  if (error?.code === '42703') {
    ({ data: products, error } = await supabase
      .from('products')
      .select('id, name')
      .order('name', { ascending: true }));
  }

  if (error) {
    console.error('Error fetching products for UGC form:', error);
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <p className="text-red-500">商品の読み込みに失敗しました。時間をおいて再度お試しください。</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-accent">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">商品レビューを投稿</h1>
            <p className="text-center text-secondary mb-8">
              ご購入いただいた商品の写真や感想をお聞かせください。
            </p>
            <SubmitReviewForm products={products || []} />
          </div>
          <footer className="text-center text-xs text-secondary mt-6">
            <p>投稿いただいた写真や内容は、当サイトやSNS等で紹介させていただく場合がございます。詳細は<a href="/terms" target="_blank" className="underline hover:text-foreground">利用規約</a>をご確認ください。</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
