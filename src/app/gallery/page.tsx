import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

const supabase = createClient();

export const revalidate = 3600; // Revalidate this page every hour

type UgcGallerySubmission = {
  id: string;
  caption: string | null;
  product: {
    id: string;
    name: string;
  }[] | null; // Typed as an array based on build error
  images: {
    id: string;
    cdn_url: string;
  }[];
};

export default async function GalleryPage() {
  const { data, error } = await supabase
    .from('ugc_submissions')
    .select(`
      id,
      caption,
      product:products (id, name),
      images:ugc_images!inner (id, cdn_url)
    `)
    .eq('status', 'approved')
    .not('images', 'is', null)
    .order('created_at', { ascending: false });

  const submissions: UgcGallerySubmission[] | null = data;

  if (error) {
    console.error('Error fetching UGC for gallery:', error);
    return <p className="text-center py-20">ギャラリーの読み込みに失敗しました。</p>;
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How to Use</h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            お客様から寄せられた、素敵な投稿の数々です。
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
          {submissions?.map((submission) => (
            submission.images.map((image) => (
              <div key={image.id} className="group relative">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                  <Image
                    src={image.cdn_url}
                    alt={submission.caption || 'User submitted content'}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className="object-cover transition-opacity duration-300 group-hover:opacity-75"
                  />
                </div>
                <div className="mt-2 block text-sm">
                  <p className="font-medium text-gray-900 truncate">{submission.product?.[0]?.name || '商品'}</p>
                  <p className="text-gray-500 truncate">{submission.caption || '素敵な投稿'}</p>
                </div>
              </div>
            ))
          ))}
        </div>
      </div>
    </div>
  );
}