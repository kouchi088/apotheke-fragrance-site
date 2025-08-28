
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';
import { useState } from 'react'; // Import useState

const supabase = createClient();

const Header = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white shadow-md py-4 border-b border-accent opacity-70">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Left Nav - Hidden on mobile, shown on md+ */}
        <nav className="hidden md:flex items-center space-x-6 text-sm flex-1">
          <Link href="/concept" className="hover:text-primary">About</Link>
          <Link href="/online-store" className="hover:text-primary">Online Store</Link>
        </nav>

        {/* Center Logo */}
        <div className="text-center flex-1 md:flex-none">
          <Link href="/" className="text-2xl font-bold tracking-wider">
            MEGURID
          </Link>
        </div>

        {/* Right Nav - Hidden on mobile, shown on md+ */}
        <div className="hidden md:flex items-center space-x-6 text-sm flex-1 justify-end">
          {user ? (
            <>
              <Link href="/profile" className="hover:text-primary">Profile</Link>
              <button onClick={handleLogout} className="hover:text-primary">Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-primary">Login</Link>
              <Link href="/auth/signup" className="hover:text-primary">Sign Up</Link>
            </>
          )}
          <Link href="/cart" className="hover:text-primary">Cart</Link>
        </div>

        {/* Mobile Menu Button (Hamburger) - Shown on mobile, hidden on md+ */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMobileMenu} className="text-foreground focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white bg-opacity-95 z-40 flex flex-col items-center justify-center space-y-6 text-lg">
          <button onClick={toggleMobileMenu} className="absolute top-4 right-4 text-foreground focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <Link href="/concept" className="hover:text-primary" onClick={toggleMobileMenu}>About</Link>
          <Link href="/online-store" className="hover:text-primary" onClick={toggleMobileMenu}>Online Store</Link>
          {user ? (
            <>
              <Link href="/profile" className="hover:text-primary" onClick={toggleMobileMenu}>Profile</Link>
              <button onClick={() => { handleLogout(); toggleMobileMenu(); }} className="hover:text-primary">Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-primary" onClick={toggleMobileMenu}>Login</Link>
              <Link href="/auth/signup" className="hover:text-primary" onClick={toggleMobileMenu}>Sign Up</Link>
            </>
          )}
          <Link href="/cart" className="hover:text-primary" onClick={toggleMobileMenu}>Cart</Link>
        </div>
      )}
    </header>
  );
};

