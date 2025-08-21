'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import FavoriteButton from '@/components/FavoriteButton';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  stock: number;
}

const supabase = createClient();

const ProductPage = ({ params }: { params: { id: string } }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();

      if (productError) {
        console.error('Error fetching product:', productError);
        setError('商品情報の取得に失敗しました。');
        setProduct(null);
      } else {
        setProduct(productData);
      }

      setLoading(false);
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast.success(`${product.name}をカートに追加しました。`);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="text-center py-20">商品が見つかりませんでした。</div>;
  }

  return (
    <div className="container mx-auto max-w-5xl py-16 px-4">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Image Section */}
        <div className="relative w-full aspect-square bg-accent">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: 'cover' }}
            priority
          />
          <FavoriteButton productId={product.id} />
        </div>

        {/* Details Section */}
        <div className="flex flex-col pt-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">{product.name}</h1>
          <p className="text-2xl text-primary mb-6">¥{product.price.toLocaleString()}</p>
          
          <div className="text-secondary leading-relaxed mb-8">
            <p>{product.description}</p>
          </div>
          
          <div className="flex items-center mb-8">
            <label htmlFor="quantity" className="mr-4 font-medium text-sm text-secondary">QUANTITY</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 p-2 border border-accent rounded-md text-center bg-white focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <button 
            onClick={handleAddToCart}
            className="w-full max-w-sm py-3 px-6 bg-primary text-white font-bold tracking-wider hover:bg-foreground transition-colors duration-300 disabled:bg-secondary"
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? 'ADD TO CART' : 'SOLD OUT'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
