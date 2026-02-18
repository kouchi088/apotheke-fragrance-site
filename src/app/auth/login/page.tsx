
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        setError('ID/パスワードが間違っています');
      } else {
        setError(error.message);
      }
      console.error('Error logging in:', error);
    } else {
      const accessToken = data.session?.access_token;
      if (accessToken) {
        document.cookie = `admin_access_token=${accessToken}; Path=/; Max-Age=3600; SameSite=Lax; Secure`;
      }
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-white text-foreground">
      <div className="mx-auto max-w-3xl px-5 sm:px-6 py-20 sm:py-24">
        <div className="border border-accent bg-white p-8 sm:p-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-secondary text-center">Account</p>
          <h1 className="mt-3 text-2xl sm:text-3xl font-serif text-center">Sign In</h1>
          <p className="mt-3 text-center text-sm text-primary">MEGURIDにログイン</p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <label htmlFor="email" className="text-xs tracking-[0.18em] uppercase text-secondary">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 px-4 py-3 border border-accent bg-white text-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs tracking-[0.18em] uppercase text-secondary">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 px-4 py-3 border border-accent bg-white text-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-6 py-3 border border-gray-button text-gray-button text-xs tracking-[0.18em] uppercase hover:bg-gray-button hover:text-white transition-colors"
            >
              Sign In
            </button>
          </div>
          </form>

          <p className="mt-8 text-center text-sm text-primary">
            アカウントをお持ちでない場合は
            {' '}
            <Link href="/auth/signup" className="border-b border-primary hover:border-foreground transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
