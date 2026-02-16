import { createClient } from '@/lib/supabaseClient';
import { unstable_noStore } from 'next/cache';
import StoreProductGrid from '@/components/StoreProductGrid';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description?: string;
  stock_quantity?: number;
}

async function getProducts() {
  unstable_noStore();
  const supabase = createClient();
  let query = supabase
    .from('products')
    .select('id, name, price, images, description, stock_quantity')
    .eq('is_published', true)
    .is('deleted_at', null);

  let { data, error } = await query;
  if (error?.code === '42703') {
    // Backward compatibility for environments where only deleted_at is missing.
    ({ data, error } = await supabase
      .from('products')
      .select('id, name, price, images, description, stock_quantity')
      .eq('is_published', true));
  }
  if (error?.code === '42703') {
    // Last fallback for environments where both visibility columns are missing.
    ({ data, error } = await supabase
      .from('products')
      .select('id, name, price, images, description, stock_quantity'));
  }

  if (error) {
    console.error('Error fetching products:', error);
    return { products: [], error };
  }
  return { products: data as Product[], error: null };
}

export default async function OnlineStore() {
  const { products, error } = await getProducts();

  return (
    <div className="bg-white min-h-screen text-foreground font-sans">
      <div className="container mx-auto max-w-6xl py-24 px-6">
        <div className="text-center mb-20">
          <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-4">Online Store</h1>
          <p className="text-secondary text-sm tracking-widest uppercase">Collection</p>
        </div>

        {error ? (
          <div className="text-center text-red-600 p-4 border border-red-200 bg-red-50 rounded">
            <p className="font-bold">Error loading products:</p>
            <p>{error.message || JSON.stringify(error)}</p>
            <p className="text-sm mt-2 text-gray-600">Please check your database connection and RLS policies.</p>
          </div>
        ) : (
          <StoreProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
