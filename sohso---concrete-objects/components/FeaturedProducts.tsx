import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';

const products: Product[] = [
  {
    id: '1',
    name: 'Geometric Planter No.04',
    price: 4800,
    category: 'Planter',
    description: 'A sharp geometric planter perfect for succulents.',
    image: 'https://picsum.photos/600/600?random=1&grayscale',
  },
  {
    id: '2',
    name: 'Circular Tray / S',
    price: 3200,
    category: 'Organization',
    description: 'Minimalist tray for jewelry or keys.',
    image: 'https://picsum.photos/600/600?random=2&grayscale',
  },
  {
    id: '3',
    name: 'Monolith Bookend',
    price: 6500,
    category: 'Study',
    description: 'Heavyweight bookend to keep your collection upright.',
    image: 'https://picsum.photos/600/600?random=3&grayscale',
  },
  {
    id: '4',
    name: 'Incense Holder / Pillar',
    price: 2800,
    category: 'Fragrance',
    description: 'Simple pillar design for stick incense.',
    image: 'https://picsum.photos/600/600?random=4&grayscale',
  },
  {
    id: '5',
    name: 'Desk Organizer Set',
    price: 12000,
    category: 'Office',
    description: 'Complete set for a clutter-free workspace.',
    image: 'https://picsum.photos/600/600?random=5&grayscale',
  },
  {
    id: '6',
    name: 'Concrete Lamp Base',
    price: 15400,
    category: 'Lighting',
    description: 'Solid base for ambient lighting.',
    image: 'https://picsum.photos/600/600?random=6&grayscale',
  },
];

const FeaturedProducts: React.FC = () => {
  return (
    <section id="products" className="py-24 bg-concrete-50">
      <div className="container mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
                <h2 className="text-3xl font-serif text-concrete-900 mb-2">Collection</h2>
                <p className="text-concrete-500 text-sm">Latest arrivals from the studio.</p>
            </div>
            <a href="#" className="hidden md:block text-xs uppercase tracking-[0.2em] border-b border-concrete-300 pb-1 hover:border-concrete-900 transition-colors mt-8 md:mt-0">
                View All Items
            </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>

        <div className="mt-16 text-center md:hidden">
            <a href="#" className="inline-block text-xs uppercase tracking-[0.2em] border-b border-concrete-300 pb-1">
                View All Items
            </a>
        </div>

      </div>
    </section>
  );
};

export default FeaturedProducts;