'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { createClient } from '@/lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

const supabase = createClient();

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isAdmin: false });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncAdminAccess = async (nextSession: Session | null) => {
      if (!nextSession?.user) {
        setIsAdmin(false);
        await fetch('/api/admin/access', {
          method: 'DELETE',
          credentials: 'same-origin',
          cache: 'no-store',
        }).catch(() => undefined);
        return;
      }

      try {
        const res = await fetch('/api/admin/access', {
          headers: nextSession.access_token
            ? { Authorization: `Bearer ${nextSession.access_token}` }
            : undefined,
          credentials: 'same-origin',
          cache: 'no-store',
        });
        if (!res.ok) {
          setIsAdmin(false);
          return;
        }

        const payload = (await res.json()) as { isAdmin?: boolean };
        setIsAdmin(Boolean(payload.isAdmin));
      } catch {
        setIsAdmin(false);
      }
    };

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      await syncAdminAccess(session);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      await syncAdminAccess(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
