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

  const { data: reviews, error: reviewsError } = await supabase
    .from('user_content')
    .select(`
      id,
      user_name,
      rating,
      review_text,
      created_at,
      content_images (image_path),
      products (name)
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(3);

  if (reviewsError) {
    console.error('Error fetching reviews for LP:', reviewsError);
  }

  return (
    <div className="antialiased bg-gray-800 selection:bg-gray-300 selection:text-gray-900">
      <main>
        {/* --- Hero Section (Main Visual) --- */}
        <section className="relative h-screen w-full overflow-hidden flex flex-col md:flex-row bg-gray-800">
          <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center px-8 md:px-24 bg-gray-800 z-10 relative">
            <div>
              <span className="text-xs font-bold tracking-[0.3em] text-gray-400 uppercase mb-4 block">
                Handcrafted Concrete
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-tight mb-8">
                静寂を、<br />
                形にする。
              </h1>
              <p className="text-gray-200 mb-10 leading-relaxed font-sans max-w-md">
                都市の素材であるコンクリートに、手仕事の温かみを。
                不揃いな気泡、独特の質感、経年変化。
                SOHSOは、日常に静かな重みをもたらすインテリアオブジェを提案します。
              </p>
              <Link
                href="/online-store"
                className="group inline-flex items-center space-x-3 text-white border-b border-white pb-1 hover:text-gray-400 hover:border-gray-400 transition-all"
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

        {/* --- New Arrivals Section (formerly Collection) --- */}
        {products && products.length > 0 && (
          <section id="new-arrivals" className="py-24 bg-gray-800">
            <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                <div>
                  <h2 className="text-3xl font-serif text-white mb-2">New Arrivals</h2>
                  <p className="text-gray-400 text-sm">Latest creations from our studio.</p>
                </div>
                <Link href="/online-store" className="hidden md:block text-xs uppercase tracking-[0.2em] border-b border-gray-400 pb-1 hover:border-white transition-colors mt-8 md:mt-0">
                  View All Items
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {products.map((product) => (
                  <Link href={`/products/${product.id}`} key={product.id} className="block group">
                    <div className="relative w-full aspect-square overflow-hidden bg-gray-700 rounded-lg shadow-md">
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
                    <h3 className="mt-4 text-lg font-semibold text-white">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-300">¥{product.price.toLocaleString()}</p>
                  </Link>
                ))}
              </div>
              <div className="mt-16 text-center md:hidden">
                <Link href="/online-store" className="inline-block text-xs uppercase tracking-[0.2em] border-b border-gray-400 pb-1">
                  View All Items
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* --- Featured / Best Sellers Section (Placeholder) --- */}
        <section id="featured" className="py-24 bg-gray-800">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-serif text-white mb-4">Featured Collections</h2>
            <p className="text-gray-400 text-sm mb-12">Curated selection of our signature items.</p>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 flex items-center justify-center bg-gray-700">
              <p className="text-gray-400">Featured Products / Best Sellers Layout Placeholder</p>
            </div>
          </div>
        </section>

        {/* --- Journal Section (formerly Concept) --- */}
        <section id="journal" className="py-24 md:py-32 bg-gray-800 text-white">
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
                  Journal
                </h2>
                <p className="text-gray-300 font-serif italic mb-6 text-lg">
                  The Philosophy of Imperfection
                </p>
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
                  <div className="pt-4">
                    <Link href="/lp/concrete-guide" className="inline-block text-xs uppercase tracking-[0.2em] border-b border-gray-500 pb-1 hover:border-white transition-colors text-gray-400">
                      コンクリート雑貨 完全ガイド
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Life with MEGURID Section (UGC) --- */}
        <section id="life-with-megurid" className="py-24 bg-gray-800 text-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16">
              <div>
                <h2 className="text-3xl font-serif text-white mb-2">MEGURIDのある暮らし</h2>
                <p className="text-gray-400 text-sm">Life with MEGURID</p>
              </div>
              <Link href="/gallery" className="hidden md:block text-xs uppercase tracking-[0.2em] border-b border-gray-400 pb-1 hover:border-white transition-colors mt-8 md:mt-0 text-gray-300">
                View Gallery
              </Link>
            </div>
            
            {reviews && reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {reviews.map((review: any) => (
                  <div key={review.id} className="flex flex-col bg-gray-700 p-6 rounded-lg border border-gray-600 shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < (review.rating || 5) ? '★' : '☆'}</span>
                        ))}
                      </div>
                      <span className="ml-3 text-xs text-gray-400 uppercase tracking-wider">
                        {review.user_name || 'Guest'}
                      </span>
                    </div>
                    
                    <p className="text-gray-200 text-sm leading-relaxed mb-6 flex-grow">
                      "{review.review_text}"
                    </p>

                    {/* Product Name Reference */}
                    {review.products && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Item</p>
                        <p className="text-xs text-gray-200 font-medium">{review.products.name}</p>
                      </div>
                    )}

                    {/* Review Image */}
                    {review.content_images && review.content_images.length > 0 && (
                      <div className="relative w-full h-48 mt-auto overflow-hidden rounded-md bg-gray-600">
                         <Image
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ugc-images/${review.content_images[0].image_path}`}
                            alt="User review image"
                            fill
                            style={{ objectFit: 'cover' }}
                            className="hover:scale-105 transition-transform duration-500"
                          />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 flex flex-col items-center justify-center bg-gray-700 text-center">
                <p className="text-gray-400 mb-4">User Posts & Reviews Placeholder</p>
                <p className="text-sm text-gray-400">あなたのMEGURIDのある暮らしをシェアしてください。</p>
                <Link href="/submit-review" className="mt-6 text-xs uppercase tracking-[0.2em] border-b border-gray-500 pb-1 hover:border-white transition-colors text-gray-400">
                  Post a Review
                </Link>
              </div>
            )}

            <div className="mt-16 text-center md:hidden">
              <Link href="/gallery" className="inline-block text-xs uppercase tracking-[0.2em] border-b border-gray-500 pb-1 text-gray-300">
                View Gallery
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}