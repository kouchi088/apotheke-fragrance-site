import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { unstable_noStore } from 'next/cache';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[]; // Array of images for slider/hover
}

async function getProducts(): Promise<Product[]> {
  unstable_noStore();
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, images'); // Select images column

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data as Product[];
}

export default async function OnlineStore() {
  const products = await getProducts();

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-5xl py-16 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-wider">PRODUCTS</h1>
          <p className="text-secondary text-sm mt-2">手作りのコンクリート雑貨コレクション</p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group relative block">
                <div className="relative w-full aspect-square overflow-hidden bg-accent rounded-lg">
                  {/* Main Image (blurred on hover) */}
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: 'cover' }}
                    className="transition-all duration-700 group-hover:blur-sm group-hover:scale-105"
                  />

                  {/* Second Image (appears on hover, slightly smaller) */}
                  {product.images && product.images.length > 1 && (
                    <Image
                      src={product.images[1]}
                      alt={`${product.name} - detail`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ objectFit: 'cover' }}
                      className="absolute inset-0 transition-all duration-700 opacity-0 group-hover:opacity-90 group-hover:scale-90"
                    />
                  )}
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-lg text-foreground">{product.name}</h3>
                  <p className="mt-1 text-base text-primary">¥{product.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-secondary">商品が見つかりませんでした。</p>
        )}
      </div>
    </div>
  );
}