import { type PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

type Role = 'admin' | string;

type AuthContextValue = {
  session: Session | null;
  roles: Role[];
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function bootstrap() {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
    }
    bootstrap();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const active = true;
    async function loadRoles(userId: string) {
      const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId);
      if (!active) return;
      if (error) {
        console.error('Failed to load roles', error);
        setRoles([]);
        return;
      }
      setRoles((data ?? []).map(item => item.role as Role));
    }

    if (session?.user.id) {
      loadRoles(session.user.id);
    } else {
      setRoles([]);
    }
  }, [session?.user.id]);

  const value = useMemo<AuthContextValue>(() => {
    async function signIn(email: string, password: string) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? { error: error.message } : {};
    }

    async function signOut() {
      await supabase.auth.signOut();
    }

    return {
      session,
      roles,
      isAdmin: roles.includes('admin'),
      loading,
      signIn,
      signOut,
    };
  }, [session, roles, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
