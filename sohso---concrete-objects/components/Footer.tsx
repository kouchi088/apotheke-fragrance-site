import React from 'react';
import { Instagram } from './Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-concrete-900 text-concrete-400 py-16">
      <div className="container mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="md:col-span-1">
            <a href="#" className="text-2xl font-serif text-white tracking-widest mb-6 block">SOHSO</a>
            <p className="text-xs leading-relaxed max-w-xs">
              Handcrafted concrete objects designed to bring quietude and substance to modern living spaces.
              <br/><br/>
              Tokyo, Japan
            </p>
          </div>

          <div>
            <h4 className="text-white text-sm uppercase tracking-widest mb-6">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">All Products</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Planters</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Organization</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Lighting</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm uppercase tracking-widest mb-6">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Care Instructions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
             <h4 className="text-white text-sm uppercase tracking-widest mb-6">Newsletter</h4>
             <p className="text-xs mb-4">Subscribe for updates and studio news.</p>
             <form className="flex border-b border-concrete-700 pb-2">
                <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="bg-transparent w-full text-white placeholder-concrete-600 focus:outline-none text-sm"
                />
                <button type="button" className="text-xs uppercase tracking-widest text-concrete-400 hover:text-white transition-colors">
                    Join
                </button>
             </form>
          </div>

        </div>

        <div className="border-t border-concrete-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>&copy; {new Date().getFullYear()} SOHSO Concrete Objects. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
             <a href="#" className="hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;