import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { unstable_noStore } from 'next/cache';
import FavoriteButton from '@/components/FavoriteButton';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

async function getProducts(): Promise<Product[]> {
  unstable_noStore();
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, image');

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
      <div className="container mx-auto max-w-5xl py-16 px-4"> {/* ★ max-w-5xl に変更 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-wider">PRODUCTS</h1>
          <p className="text-secondary text-sm mt-2">手作りのコンクリート雑貨コレクション</p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16"> {/* ★ 2列表示に変更 */}
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group">
                <div className="relative w-full aspect-square overflow-hidden bg-accent">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw" /* ★ sizesを2列用に最適化 */
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                  <FavoriteButton productId={product.id} />
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
