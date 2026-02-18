'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const supabase = createClient();

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('name, address, phone')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setName(data.name || '');
        setAddress(data.address || '');
        setPhone(data.phone || '');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    } else {
      setLoading(false);
    }
  }, [user, fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to update your profile.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ id: user.id, name, address, phone }, { onConflict: 'id' });

      if (error) throw error;

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-primary">
        <div className="animate-pulse tracking-widest uppercase text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-primary">
        <div className="text-center">
          <p className="mb-4 tracking-widest text-sm">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-foreground py-24 px-6 font-sans">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <span className="block text-xs font-bold tracking-[0.2em] text-gray-button mb-4 uppercase">Account</span>
          <h1 className="text-3xl md:text-4xl font-serif text-foreground">Your Profile</h1>
        </div>

        <div className="bg-white border border-accent p-8 md:p-12 shadow-sm rounded-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="email" className="block text-xs font-bold tracking-widest text-primary uppercase mb-2">Email</label>
              <input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="block w-full px-4 py-3 bg-accent border border-transparent text-primary text-sm focus:outline-none cursor-not-allowed"
              />
              <p className="mt-2 text-[10px] text-secondary">Email address cannot be changed.</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-xs font-bold tracking-widest text-primary uppercase mb-2">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="block w-full px-4 py-3 bg-white border border-accent text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-xs font-bold tracking-widest text-primary uppercase mb-2">Address</label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, Country"
                className="block w-full px-4 py-3 bg-white border border-accent text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-bold tracking-widest text-primary uppercase mb-2">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="block w-full px-4 py-3 bg-white border border-accent text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 border border-gray-button bg-transparent text-gray-button hover:bg-gray-button hover:text-white text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
