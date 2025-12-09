import { createClient } from '@/lib/supabaseClient';
import ProductDetails from '@/components/ProductDetails';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

const supabase = createClient();
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.megurid.com';

// --- UGC Reviews Component ---
const ProductReviews = () => {
  return (
    <div className="bg-background py-16 text-center border-t border-accent">
      <Link 
        href="/gallery" 
        className="text-sm font-serif text-primary hover:text-foreground tracking-widest uppercase border-b border-primary hover:border-foreground pb-1 transition-colors"
      >
        View Reviews & Gallery
      </Link>
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
      <ProductDetails product={product} />
      <ProductReviews />
    </>
  );
};

export default ProductPage;
