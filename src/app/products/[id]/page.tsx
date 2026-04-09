import { createClient } from '@/lib/supabaseClient';
import ProductDetails from '@/components/ProductDetails';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  buildAbsoluteUrl,
  buildImageUrl,
  createBreadcrumbJsonLd,
  defaultDescription,
  defaultOgImage,
  siteName,
  siteUrl,
} from '@/lib/seo';

const supabase = createClient();
export const revalidate = 60;

// --- UGC Reviews Component ---
const ProductReviews = ({ productId }: { productId: string }) => {
  return (
    <div className="bg-background py-16 text-center border-t border-accent">
      <Link 
        href={`/gallery?productId=${productId}`} 
        className="text-sm font-serif text-primary hover:text-foreground tracking-widest uppercase border-b border-primary hover:border-foreground pb-1 transition-colors"
      >
        View Reviews & Gallery
      </Link>
    </div>
  );
};


// Generate static paths for all products at build time
export async function generateStaticParams() {
  let { data: products, error } = await supabase
    .from('products')
    .select('id')
    .eq('is_published', true)
    .is('deleted_at', null);
  if (error?.code === '42703') {
    ({ data: products, error } = await supabase
      .from('products')
      .select('id')
      .eq('is_published', true));
  }
  if (error?.code === '42703') {
    ({ data: products } = await supabase.from('products').select('id'));
  }
  return products?.map(({ id }) => ({ id })) || [];
}

// Generate metadata for the page (title, description)
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  let { data: product, error } = await supabase
    .from('products')
    .select('name, description, images, image')
    .eq('id', params.id)
    .eq('is_published', true)
    .is('deleted_at', null)
    .single();
  if (error?.code === '42703') {
    ({ data: product } = await supabase
      .from('products')
      .select('name, description, images, image')
      .eq('id', params.id)
      .eq('is_published', true)
      .single());
  }
  if (error?.code === '42703') {
    ({ data: product } = await supabase
      .from('products')
      .select('name, description, images, image')
      .eq('id', params.id)
      .single());
  }

  const title = product?.name || 'Product';
  const description = product?.description || defaultDescription;
  const firstImage = buildImageUrl(product?.images?.[0] || product?.image || null) || defaultOgImage;
  const canonicalUrl = buildAbsoluteUrl(`/products/${params.id}`);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName,
      images: [
        {
          url: firstImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [firstImage],
    },
  };
}

// The main page component, now a Server Component
const ProductPage = async ({ params }: { params: { id: string } }) => {
  let productQuery = supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .eq('is_published', true)
    .is('deleted_at', null)
    .single();

  let productPromise = productQuery;
  const [productResFirst, reviewsRes, ratedReviewsRes] = await Promise.all([
    productPromise,
    supabase.from('ugc_submissions').select(`*, images:ugc_images(*)`).eq('product_id', params.id).eq('status', 'approved').order('created_at', { ascending: false }),
    supabase
      .from('user_content')
      .select('rating, review_text, user_name, created_at')
      .eq('product_id', params.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false }),
  ]);

  let productRes = productResFirst;
  if (productRes.error?.code === '42703') {
    productRes = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .eq('is_published', true)
      .single();
  }
  if (productRes.error?.code === '42703') {
    productRes = await supabase.from('products').select('*').eq('id', params.id).single();
  }

  // Fetch product and approved reviews in parallel
  const { data: product, error: productError } = productRes;
  const { data: reviews, error: reviewsError } = reviewsRes;
  const ratedReviews = ratedReviewsRes.error ? [] : (ratedReviewsRes.data || []);

  if (productError || !product) {
    notFound(); // Show 404 page if product not found
  }

  if (reviewsError) {
    console.error("Error fetching reviews:", reviewsError);
    // Don't block the page from rendering, just show an error in the console
  }

  const productUrl = `${siteUrl}/products/${product.id}`;
  const productImages = Array.isArray(product.images)
    ? product.images.map((img: string) => buildImageUrl(img)).filter(Boolean)
    : [];
  const fallbackImage = buildImageUrl(product.image);
  const normalizedImages = (productImages.length > 0 ? productImages : fallbackImage ? [fallbackImage] : []) as string[];
  const validRatings = ratedReviews
    .map((review: any) => Number(review.rating))
    .filter((rating: number) => Number.isFinite(rating) && rating > 0);
  const averageRating = validRatings.length > 0
    ? (validRatings.reduce((sum: number, rating: number) => sum + rating, 0) / validRatings.length).toFixed(1)
    : null;
  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { name: 'ホーム', path: '/' },
    { name: '商品一覧', path: '/online-store' },
    { name: product.name, path: `/products/${product.id}` },
  ]);

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: normalizedImages,
    description: product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'megurid',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      price: product.price,
      priceCurrency: 'JPY',
      availability: product.stock_quantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(averageRating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: averageRating,
        reviewCount: String(validRatings.length),
      },
    } : {}),
    review: reviews?.map(review => ({
      '@type': 'Review',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Preload other images in the carousel for faster navigation */}
      {product.images && product.images.length > 1 && (
        product.images.slice(1).map((img: string) => (
          <link key={img} rel="preload" as="image" href={img} />
        ))
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-6 pt-8 text-[11px] uppercase tracking-[0.22em] text-secondary md:text-xs">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/online-store" className="transition-colors hover:text-foreground">Store</Link>
            </li>
            <li>/</li>
            <li className="text-foreground">{product.name}</li>
          </ol>
        </nav>
      </div>
      <ProductDetails product={product} />
      <ProductReviews productId={product.id} />
    </>
  );
};

export default ProductPage;
