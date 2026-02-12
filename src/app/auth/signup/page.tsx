
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';

const supabase = createClient();

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      console.error('Error signing up:', error);
    } else {
      setSuccess('アカウントが正常に作成されました！メールアドレスを確認してアカウントを有効にしてください。');
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-white text-foreground">
      <div className="mx-auto max-w-3xl px-5 sm:px-6 py-20 sm:py-24">
        <div className="border border-accent bg-white p-8 sm:p-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-secondary text-center">Account</p>
          <h1 className="mt-3 text-2xl sm:text-3xl font-serif text-center">Sign Up</h1>
          <p className="mt-3 text-center text-sm text-primary">新規アカウント作成</p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {success && <p className="text-green-600 text-sm text-center">{success}</p>}
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
              autoComplete="new-password"
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
              Sign Up
            </button>
          </div>
          </form>

          <p className="mt-8 text-center text-sm text-primary">
            すでにアカウントをお持ちの場合は
            {' '}
            <Link href="/auth/login" className="border-b border-primary hover:border-foreground transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
