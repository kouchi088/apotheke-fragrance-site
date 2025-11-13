import { createClient } from '@/lib/supabaseClient';
import ProductDetails from '@/components/ProductDetails';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

const supabase = createClient();
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.megurid.com';

// --- UGC Reviews Component ---
const ProductReviews = ({ reviews }: { reviews: any[] }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">お客様の声</h2>
          <p className="mt-4 text-secondary">この商品のレビューはまだありません。</p>
          <Link href="/submit-review" className="mt-8 inline-block px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-foreground transition-colors duration-300">
            最初のレビューを投稿する
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">お客様の声</h2>
          <p className="mt-2 text-lg leading-8 text-secondary">
            実際に商品をご利用いただいたお客様からのレビューをご紹介します。
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className="flex flex-col items-start justify-between">
              {review.images && review.images.length > 0 && (
                <div className="relative w-full">
                  <Image
                    src={review.images[0].cdn_url}
                    alt={review.caption || 'User review'}
                    width={400}
                    height={400}
                    className="aspect-[16/9] w-full rounded-2xl bg-accent object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10" />
                </div>
              )}
              <div className="group relative w-full">
                <p className="mt-5 text-sm leading-6 text-secondary line-clamp-3">
                  {review.caption}
                </p>
                <div className="mt-6 flex items-center gap-x-4 text-sm">
                  <div className="font-semibold text-foreground">
                    {review.nickname || '匿名ユーザー'}
                  </div>
                  <div className="text-secondary">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};


// Generate static paths for all products at build time
export async function generateStaticParams() {
  const { data: products } = await supabase.from('products').select('id');
  return products?.map(({ id }) => ({ id })) || [];
}

// Generate metadata for the page (title, description)
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('id', params.id)
    .single();

  return {
    title: product?.name || 'Product',
    description: product?.description || '',
  };
}

// The main page component, now a Server Component
const ProductPage = async ({ params }: { params: { id: string } }) => {
  // Fetch product and approved reviews in parallel
  const [productRes, reviewsRes] = await Promise.all([
    supabase.from('products').select('*').eq('id', params.id).single(),
    supabase.from('ugc_submissions').select(`*, images:ugc_images(*)`).eq('product_id', params.id).eq('status', 'approved').order('created_at', { ascending: false })
  ]);

  const { data: product, error: productError } = productRes;
  const { data: reviews, error: reviewsError } = reviewsRes;

  if (productError || !product) {
    notFound(); // Show 404 page if product not found
  }

  if (reviewsError) {
    console.error("Error fetching reviews:", reviewsError);
    // Don't block the page from rendering, just show an error in the console
  }

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.length > 0 
      ? product.images.map((img: string) => `${siteUrl}${img}`) 
      : (product.image ? [`${siteUrl}${product.image}`] : []),
    description: product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'megurid',
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${product.id}`,
      price: product.price,
      priceCurrency: 'JPY',
      availability: product.stock_quantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    review: reviews?.map(review => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5', // Assuming a 5-star rating for now
      },
      author: {
        '@type': 'Person',
        name: review.nickname || '匿名ユーザー',
      },
      reviewBody: review.caption,
      datePublished: new Date(review.created_at).toISOString(),
    })) || [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetails product={product} />
      <ProductReviews reviews={reviews || []} />
    </>
  );
};

export default ProductPage;