import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stock_quantity: number;
  stripe_price_id: string; // For linking
}

export default async function Home() {
  const supabase = createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, price, image, stock_quantity, stripe_price_id')
    .limit(4); // Fetch 4 products

  if (error) {
    console.error('Error fetching products for homepage:', error);
  }

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[calc(100vh-80px)] flex items-center justify-center text-center text-white">
        <Image
          src="/concept-main.jpg"
          alt="Concrete background"
          fill
          style={{ objectFit: 'cover' }}
          className="-z-10 brightness-50"
          priority
        />
        <div className="flex flex-col items-center">
          <h1 className="text-6xl md:text-8xl font-bold tracking-widest">MEGURID</h1>
          <p className="mt-2 text-lg md:text-xl tracking-wider">巡る季節、変わらぬ価値。</p>
          <Link href="/online-store"
            className="mt-8 px-10 py-3 border border-white hover:bg-white hover:text-black transition-colors duration-300 text-sm tracking-widest">
            EXPLORE PRODUCTS
          </Link>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">OUR PHILOSOPHY</h2>
          <p className="text-sm text-secondary mb-8">コンクリートに込められた想い</p>
          <p className="text-left leading-relaxed">
            私たちのブランドは、コンクリートという無機質な素材の中に、予期せぬ温かみと生命感を見出すことから始まりました。日本の伝統的な美意識である「わびさび」—不完全さの中にある美—にインスパイアされ、私たちは一つ一つ手作業で製品を創り出しています。ミニマリズムを追求し、静寂と調和を大切にする。それが私たちの哲学です。
          </p>
        </div>
      </section>

      {/* Products Section */}
      {products && products.length > 0 && (
        <section className="py-20 md:py-32 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">OUR PRODUCTS</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
              {products.map((product) => (
                <Link href={`/products/${product.id}`} key={product.id} className="block group">
                  <div className="relative w-full aspect-square overflow-hidden bg-white rounded-lg shadow-md">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{product.name}</h3>
                  <p className="mt-1 text-sm text-gray-700">¥{product.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
