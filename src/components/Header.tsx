
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();

const Header = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="w-full py-4 border-b border-accent">
      <div className="container mx-auto flex items-center px-4">
        <nav className="flex items-center space-x-6 text-sm flex-1">
          <Link href="/concept" className="hover:text-primary">About</Link>
          <Link href="/online-store" className="hover:text-primary">Online Store</Link>
        </nav>

        <div className="text-center flex-1">
          <Link href="/" className="text-2xl font-bold tracking-wider">
            MEGURID
          </Link>
        </div>

        <div className="flex items-center space-x-6 text-sm flex-1 justify-end">
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
      </div>
    </header>
  );
};

export default Header;

