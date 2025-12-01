import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X } from './Icons';
import { NavItem } from '../types';

const navItems: NavItem[] = [
  { label: 'Collection', href: '#products' },
  { label: 'About', href: '#concept' },
  { label: 'Journal', href: '#' },
  { label: 'Contact', href: '#' },
];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
        isScrolled || mobileMenuOpen ? 'bg-concrete-50/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="z-50">
          <a href="#" className="text-2xl font-serif font-semibold tracking-widest text-concrete-900">
            SOHSO
          </a>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-12">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm tracking-widest uppercase text-concrete-600 hover:text-concrete-900 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Icons */}
        <div className="hidden md:flex items-center space-x-6">
          <button aria-label="Cart" className="text-concrete-800 hover:text-black transition-colors">
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden z-50 flex items-center space-x-4">
           <button aria-label="Cart" className="text-concrete-800">
            <ShoppingBag className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-concrete-800 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-concrete-50 flex flex-col justify-center items-center space-y-8 transition-transform duration-500 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-serif text-concrete-900 tracking-widest"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;