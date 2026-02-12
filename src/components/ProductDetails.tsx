'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

// Define the Product type matching the data from Supabase
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  stock_quantity: number;
  images: string[];
}

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Force scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!product) {
    return <div className="text-center py-20">商品が見つかりませんでした。</div>;
  }

  const normalizeImageSrc = (src?: string) => {
    if (!src) return '';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      return src;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Relative Supabase Storage path like "/storage/v1/object/public/..."
    if (src.startsWith('/storage/v1/object/public/')) {
      return supabaseUrl ? `${supabaseUrl}${src}` : src;
    }

    // Public folder assets
    if (src.startsWith('/')) {
      return src;
    }

    // Bare storage path like "product-images/xxx.jpg"
    return supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/${src.replace(/^\/+/, '')}` : src;
  };

  const normalizedImages = (product.images || [])
    .map((img) => normalizeImageSrc(img))
    .filter((img) => img.length > 0);
  const fallbackImage = normalizeImageSrc(product.image);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name}をカートに追加しました。`);
  };

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    try {
      const response = await fetch('/api/checkout/quick-buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product.id, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '購入処理に失敗しました。');
      }

      window.location.href = data.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(errorMessage);
      setIsBuyingNow(false);
    }
  };

  const nextImage = () => {
    if (normalizedImages.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % normalizedImages.length);
    }
  };

  const prevImage = () => {
    if (normalizedImages.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + normalizedImages.length) % normalizedImages.length);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-12 px-6 font-sans">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Image Section */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          {normalizedImages.length > 0 && (
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto w-full md:w-12 max-h-[500px] scrollbar-hide py-1">
              {normalizedImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-10 h-10 flex-shrink-0 cursor-pointer border transition-all duration-200 ${
                    currentImageIndex === index ? 'border-foreground' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    sizes="40px"
                    style={{ objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="relative flex-1 aspect-square bg-accent w-full md:w-auto">
            {normalizedImages.length > 0 ? (
              <>
                <Image
                  src={normalizedImages[currentImageIndex]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
                {normalizedImages.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                    <button
                      onClick={prevImage}
                      className="bg-white/50 hover:bg-white text-primary p-2 rounded-full focus:outline-none transition-colors pointer-events-auto"
                    >
                      &lt;
                    </button>
                    <button
                      onClick={nextImage}
                      className="bg-white/50 hover:bg-white text-primary p-2 rounded-full focus:outline-none transition-colors pointer-events-auto"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Image
                src={fallbackImage || '/placeholder.jpg'}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                priority
              />
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="flex flex-col pt-4 md:pt-0">
          <h1 className="text-xl md:text-2xl font-serif font-medium mb-2 text-foreground">{product.name}</h1>
          <p className="text-lg text-primary mb-8">¥{product.price.toLocaleString()}</p>
          
          {/* Quantity & Buttons moved above description for mobile UX */}
          <div className="mb-10">
            <div className="flex items-center mb-6">
              <label htmlFor="quantity" className="mr-4 text-xs font-bold tracking-widest text-secondary uppercase">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                max={product.stock_quantity}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-20 p-2 border border-accent text-center bg-white text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="w-full max-w-sm flex flex-col gap-4">
              <button 
                onClick={handleAddToCart}
                className="w-full py-3 px-6 border border-gray-button text-gray-button text-xs font-bold tracking-widest hover:bg-gray-button hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                disabled={product.stock_quantity === 0}
              >
                {product.stock_quantity > 0 ? 'Add to Cart' : 'Sold Out'}
              </button>
              <button 
                onClick={handleBuyNow}
                className="w-full py-3 px-6 bg-button-fill text-foreground text-xs font-bold tracking-widest hover:bg-primary hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase border border-transparent"
                disabled={product.stock_quantity === 0 || isBuyingNow}
              >
                {isBuyingNow ? 'Processing...' : (product.stock_quantity > 0 ? 'Buy Now' : 'Sold Out')}
              </button>
            </div>
          </div>

          <div className="text-primary text-sm leading-loose mb-8 border-t border-accent pt-8">
            <p className="whitespace-pre-line">{product.description}</p>
          </div>
          
          <div className="w-full max-w-sm mt-2 text-center">
            <Link href="/gallery" className="text-xs text-secondary hover:text-foreground underline decoration-1 underline-offset-4 transition-colors">
              この商品のレビューを見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
