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

async function getProducts(): Promise<Product[]> {
  unstable_noStore();
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, images, description, stock_quantity')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data as Product[];
}

export default async function OnlineStore() {
  const products = await getProducts();

  return (
    <div className="bg-white min-h-screen text-foreground font-sans">
      <div className="container mx-auto max-w-6xl py-24 px-6">
        <div className="text-center mb-20">
          <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-4">Online Store</h1>
          <p className="text-secondary text-sm tracking-widest uppercase">Collection</p>
        </div>

        <StoreProductGrid products={products} />
      </div>
    </div>
  );
}
