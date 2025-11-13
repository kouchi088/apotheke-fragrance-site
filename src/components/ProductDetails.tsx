'use client';

import { useState } from 'react';
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

  // Loading and error states are no longer needed here, as data is fetched by the server component
  if (!product) {
    // This should ideally not be reached if the parent server component handles it
    return <div className="text-center py-20">商品が見つかりませんでした。</div>;
  }

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
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + product.images.length) % product.images.length);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-16 px-4">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="relative w-full aspect-square">
          {product.images && product.images.length > 0 ? (
            <>
              <Image
                src={product.images[currentImageIndex]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                priority
              />
              {product.images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <button
                    onClick={prevImage}
                    className="bg-black bg-opacity-50 text-white p-2 rounded-full focus:outline-none"
                  >
                    &lt;
                  </button>
                  <button
                    onClick={nextImage}
                    className="bg-black bg-opacity-50 text-white p-2 rounded-full focus:outline-none"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          ) : (
            <Image
              src={product.image} // Fallback to single image
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              priority
            />
          )}
        </div>

        <div className="flex flex-col pt-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">{product.name}</h1>
          <p className="text-2xl text-primary mb-6">¥{product.price.toLocaleString()}</p>
          
          <div className="text-secondary leading-relaxed mb-8">
            <p className="whitespace-pre-line">{product.description}</p>
          </div>
          
          <div className="flex items-center mb-8">
            <label htmlFor="quantity" className="mr-4 font-medium text-sm text-secondary">QUANTITY</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              max={product.stock_quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 p-2 border border-accent rounded-md text-center bg-white focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="w-full max-w-sm flex flex-col gap-4">
            <button 
              onClick={handleAddToCart}
              className="w-full py-3 px-6 bg-primary text-white font-bold tracking-wider hover:bg-foreground transition-colors duration-300 disabled:bg-secondary"
              disabled={product.stock_quantity === 0}
            >
              {product.stock_quantity > 0 ? 'ADD TO CART' : 'SOLD OUT'}
            </button>
            <button 
              onClick={handleBuyNow}
              className="w-full py-3 px-6 bg-transparent border border-primary text-primary font-bold tracking-wider hover:bg-primary hover:text-white transition-colors duration-300 disabled:bg-secondary disabled:text-white disabled:border-secondary"
              disabled={product.stock_quantity === 0 || isBuyingNow}
            >
              {isBuyingNow ? 'PROCESSING...' : (product.stock_quantity > 0 ? 'BUY NOW' : 'SOLD OUT')}
            </button>
          </div>
          <div className="w-full max-w-sm mt-6 text-center">
            <Link href="/submit-review" className="text-sm text-gray-600 hover:text-black underline">
              この商品のレビューを書く
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;