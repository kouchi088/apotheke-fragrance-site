import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabaseClient';

// --- Helper Components (adapted from sohso/components/Icons.tsx) ---
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
  </svg>
);

// --- Page Component ---
export default async function LandingPage() {
  const supabase = createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, price, images')
    .limit(3);

  if (error) {
    console.error('Error fetching products for LP:', error);
  }

  return (
    <div className="antialiased bg-white selection:bg-gray-300 selection:text-gray-900">
      <main>
        {/* --- Hero Section (adapted from sohso/components/Hero.tsx) --- */}
        <section className="relative h-screen w-full overflow-hidden flex flex-col md:flex-row bg-gray-100">
          <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center px-8 md:px-24 bg-gray-50 z-10 relative">
            <div>
              <span className="text-xs font-bold tracking-[0.3em] text-gray-400 uppercase mb-4 block">
                Handcrafted Concrete
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-gray-900 leading-tight mb-8">
                静寂を、<br />
                形にする。
              </h1>
              <p className="text-gray-600 mb-10 leading-relaxed font-sans max-w-md">
                都市の素材であるコンクリートに、手仕事の温かみを。
                不揃いな気泡、独特の質感、経年変化。
                SOHSOは、日常に静かな重みをもたらすインテリアオブジェを提案します。
              </p>
              <Link
                href="/online-store"
                className="group inline-flex items-center space-x-3 text-gray-900 border-b border-gray-900 pb-1 hover:text-gray-600 hover:border-gray-600 transition-all"
              >
                <span className="text-sm tracking-widest uppercase">View Collection</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
            <div className="absolute inset-0 bg-black/5 z-10"></div>
            <Image
              src="https://picsum.photos/1000/1200?grayscale"
              alt="Concrete vase detail"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </section>

        {/* --- Concept Section (adapted from sohso/components/Concept.tsx) --- */}
        <section id="concept" className="py-24 md:py-32 bg-gray-800 text-gray-50">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="w-full md:w-1/2">
                <div className="aspect-[4/5] relative overflow-hidden bg-gray-700">
                  <Image
                    src="https://picsum.photos/800/1000?blur=2&grayscale"
                    alt="Process of making concrete"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="hover:scale-105 transition-transform duration-700 opacity-80"
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2 md:pl-12">
                <h2 className="text-3xl md:text-4xl font-serif mb-8 leading-snug">
                  偶然が生み出す、<br />唯一無二の表情。
                </h2>
                <div className="space-y-6 text-gray-300 font-sans leading-loose">
                  <p>
                    コンクリートは、水、砂、セメントが混ざり合い、化学反応を起こして固まる素材です。その過程で生まれる気泡（ボイド）や色むらは、決して欠陥ではありません。
                  </p>
                  <p>
                    それは、素材が呼吸をした証であり、二つとして同じものが存在しないことの証明です。私たちは機械的な均一さよりも、手仕事による偶然性を大切にしています。
                  </p>
                  <p>
                    時が経つにつれて深まる手触りと、空間に馴染んでいく静かな佇まいをお楽しみください。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Featured Products Section (adapted from sohso/components/FeaturedProducts.tsx) --- */}
        {products && products.length > 0 && (
          <section id="products" className="py-24 bg-gray-50">
            <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                <div>
                  <h2 className="text-3xl font-serif text-gray-900 mb-2">Collection</h2>
                  <p className="text-gray-500 text-sm">Latest arrivals from the studio.</p>
                </div>
                <Link href="/online-store" className="hidden md:block text-xs uppercase tracking-[0.2em] border-b border-gray-300 pb-1 hover:border-gray-900 transition-colors mt-8 md:mt-0">
                  View All Items
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {products.map((product) => (
                  <Link href={`/products/${product.id}`} key={product.id} className="block group">
                    <div className="relative w-full aspect-square overflow-hidden bg-gray-200 rounded-lg shadow-md">
                      {product.images && product.images.length > 0 && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-700">¥{product.price.toLocaleString()}</p>
                  </Link>
                ))}
              </div>
              <div className="mt-16 text-center md:hidden">
                <Link href="/online-store" className="inline-block text-xs uppercase tracking-[0.2em] border-b border-gray-300 pb-1">
                  View All Items
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
