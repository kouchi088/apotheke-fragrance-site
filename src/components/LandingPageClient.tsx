"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

// --- Helper Components ---
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
  </svg>
);

// --- Client Component ---
export default function LandingPageClient({ products, reviews, featuredProducts }: { products: any[]; reviews: any[]; featuredProducts: any[] }) {
  const { addToCart } = useCart();

  const handleAddToCart = (product: any) => {
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg',
      images: product.images || [],
      description: product.description || '',
      stock_quantity: product.stock_quantity || 0,
    };
    addToCart(productToAdd, 1);
  };

  return (
    <div className="antialiased bg-white selection:bg-accent selection:text-foreground">
      <main>
        {/* --- Hero Section (Main Visual) --- */}
        <section className="relative h-screen w-full overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://picsum.photos/1600/1200?grayscale"
              alt="Concrete vase detail"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center items-start">
            <div className="bg-white/90 p-8 md:p-12 max-w-xl backdrop-blur-sm border border-white/50">
              <span className="text-xs font-bold tracking-[0.3em] text-secondary uppercase mb-4 block">
                Handcrafted Concrete
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-foreground leading-tight mb-8">
                MEGURID <br />
                巡り出会う
              </h1>
              <p className="text-primary mb-10 leading-relaxed font-sans">
                都市の素材であるコンクリートに、手仕事の温かみを。<br />
                不揃いな気泡、独特の質感、経年変化。<br />
                MEGURIDは、日常に静かな重みをもたらすインテリアオブジェを提案します。
              </p>
              <Link
                href="/online-store"
                className="group inline-flex items-center space-x-3 text-foreground border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-all"
              >
                <span className="text-sm tracking-widest uppercase">View Collection</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* --- New Arrivals Section (formerly Collection) --- */}
        {products && products.length > 0 && (
          <section id="new-arrivals" className="py-24 bg-white">
            <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
                <div>
                  <h2 className="text-3xl font-serif text-foreground mb-2">New Arrivals</h2>
                  <p className="text-secondary text-sm">Latest creations from our studio.</p>
                </div>
                <Link href="/online-store" className="hidden md:block text-xs uppercase tracking-[0.2em] border-b border-primary pb-1 hover:border-foreground transition-colors mt-8 md:mt-0">
                  View All Items
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {products.map((product: any) => (
                  <div key={product.id} className="group">
                    <Link href={`/products/${product.id}`} className="block">
                      <div className="relative w-full aspect-square overflow-hidden bg-accent rounded-lg shadow-md">
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
                      <h3 className="mt-4 text-lg font-semibold text-foreground">{product.name}</h3>
                    </Link>
                    <p className="mt-1 text-sm text-primary">¥{product.price.toLocaleString()}</p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="mt-4 px-4 py-2 border border-gray-button text-gray-button text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-colors w-full"
                    >
                      カートに追加
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-16 text-center md:hidden">
                <Link href="/online-store" className="inline-block text-xs uppercase tracking-[0.2em] border-b border-primary pb-1">
                  View All Items
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* --- Featured / Best Sellers Section --- */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section id="featured" className="py-24 bg-white">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-3xl font-serif text-foreground mb-4">Featured Collections</h2>
              <p className="text-secondary text-sm mb-12">Curated selection of our signature items.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {featuredProducts.map((product: any) => (
                  <div key={product.id} className="group">
                    <Link href={`/products/${product.id}`} className="block">
                      <div className="relative w-full aspect-square overflow-hidden bg-accent rounded-lg shadow-md">
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
                      <h3 className="mt-4 text-lg font-semibold text-foreground">{product.name}</h3>
                    </Link>
                    <p className="mt-1 text-sm text-primary">¥{product.price.toLocaleString()}</p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="mt-4 px-4 py-2 border border-gray-button text-gray-button text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-colors w-full"
                    >
                      カートに追加
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- Journal Section (formerly Concept) --- */}
        <section id="journal" className="py-24 md:py-32 bg-white text-foreground">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="w-full md:w-1/2">
                <div className="aspect-[4/5] relative overflow-hidden bg-accent">
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
                <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-8 leading-snug">
                  Journal
                </h2>
                <p className="text-primary font-serif italic mb-6 text-lg">
                  The Philosophy of Imperfection
                </p>
                <div className="space-y-6 text-primary font-sans leading-loose">
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
                    <Link href="/concept" className="inline-block text-xs uppercase tracking-[0.2em] border-b border-primary pb-1 hover:border-foreground transition-colors text-primary">
                      Read More about Our Concept
                    </Link>
                  </div>

                  {/* --- Column Section (Kurasu Style) --- */}
                  <div className="mt-12 pt-12 border-t border-secondary">
                    <h3 className="text-sm font-serif text-foreground mb-6">Latest Column</h3>
                    <Link href="/lp/concrete-guide" className="block group">
                      <div className="flex gap-6 items-start">
                        <div className="w-24 h-24 bg-accent flex-shrink-0 relative overflow-hidden">
                           {/* Placeholder for Column Image */}
                           <div className="absolute inset-0 flex items-center justify-center text-secondary text-[10px]">
                             Image
                           </div>
                        </div>
                        <div>
                          <p className="text-xs text-secondary mb-2">2023.11.22</p>
                          <h4 className="text-sm text-foreground font-medium leading-relaxed group-hover:text-primary transition-colors">
                            コンクリート雑貨 完全ガイド：素材の特性からお手入れまで
                          </h4>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Life with MEGURID Section (UGC) --- */}
        <section id="life-with-megurid" className="py-24 bg-white text-foreground">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
              <div>
                <h2 className="text-3xl font-serif text-foreground mb-2">MEGURIDのある暮らし</h2>
                <p className="text-secondary text-sm">Life with MEGURID</p>
              </div>
              <Link href="/gallery" className="hidden md:block text-xs uppercase tracking-[0.2em] border-b border-primary pb-1 hover:border-foreground transition-colors mt-8 md:mt-0 text-secondary">
                View Gallery
              </Link>
            </div>
            
            {reviews && reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {reviews.map((review: any) => (
                  <div key={review.id} className="flex flex-col bg-white p-6 rounded-lg border border-accent shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-500 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < (review.rating || 5) ? '★' : '☆'}</span>
                        ))}
                      </div>
                      <span className="ml-3 text-xs text-secondary uppercase tracking-wider">
                        {review.user_name || 'Guest'}
                      </span>
                    </div>
                    
                    <p className="text-primary text-sm leading-relaxed mb-6 flex-grow">
                      "{review.review_text}"
                    </p>

                    {/* Product Name Reference */}
                    {review.products && (
                      <div className="mb-4">
                        <p className="text-xs text-secondary uppercase tracking-widest">Item</p>
                        <p className="text-xs text-primary font-medium">{review.products.name}</p>
                      </div>
                    )}

                    {/* Review Image */}
                    {review.content_images && review.content_images.length > 0 && (
                      <div className="relative w-full h-48 mt-auto overflow-hidden rounded-md bg-accent">
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
              <div className="border-2 border-dashed border-primary rounded-lg p-12 flex flex-col items-center justify-center bg-accent text-center">
                <p className="text-primary mb-4">User Posts & Reviews Placeholder</p>
                <p className="text-sm text-primary">あなたのMEGURIDのある暮らしをシェアしてください。</p>
                <Link href="/submit-review" className="mt-6 text-xs uppercase tracking-[0.2em] border-b border-secondary pb-1 hover:border-foreground transition-colors text-primary">
                  Post a Review
                </Link>
              </div>
            )}

            <div className="mt-16 text-center md:hidden">
              <Link href="/gallery" className="inline-block text-xs uppercase tracking-[0.2em] border-b border-primary pb-1 text-secondary">
                View Gallery
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
