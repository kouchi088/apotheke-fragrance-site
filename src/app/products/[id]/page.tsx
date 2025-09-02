import { createClient } from '@/lib/supabaseClient';
import ProductDetails from '@/components/ProductDetails';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

const supabase = createClient();
const siteUrl = 'https://www.megurid.com';

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
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !product) {
    notFound(); // Show 404 page if product not found
  }

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.length > 0 
      ? product.images.map((img: string) => `${siteUrl}${img}`) 
      : [`${siteUrl}${product.image}`],
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
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetails product={product} />
    </>
  );
};

export default ProductPage;