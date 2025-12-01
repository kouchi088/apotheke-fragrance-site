import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-square overflow-hidden bg-concrete-200 mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        <button className="absolute bottom-4 right-4 bg-white text-black text-xs px-4 py-2 uppercase tracking-widest opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            View Details
        </button>
      </div>
      
      <div className="flex flex-col items-start">
        <span className="text-xs text-concrete-400 mb-1 uppercase tracking-widest">{product.category}</span>
        <h3 className="text-lg font-serif text-concrete-800 mb-1 group-hover:text-concrete-600 transition-colors">
            {product.name}
        </h3>
        <p className="text-sm font-sans text-concrete-500">
            ¥{product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;