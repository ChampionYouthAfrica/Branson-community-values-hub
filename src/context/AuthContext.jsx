import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const ALLOWED_DOMAIN = 'branson.org';

// The login gate only enforces once this is turned on in Vercel
// (VITE_AUTH_ENABLED=true) — after Google OAuth is configured in Supabase.
// This prevents locking everyone out before setup is complete.
export const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === 'true';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(AUTH_ENABLED);
  const [domainError, setDomainError] = useState(false);

  useEffect(() => {
    if (!AUTH_ENABLED) return;
    let active = true;

    const apply = (session) => {
      if (!session) { setUser(null); return; }
      const email = session.user?.email?.toLowerCase() || '';
      if (!email.endsWith('@' + ALLOWED_DOMAIN)) {
        // Signed in, but not a branson.org account — reject and sign out.
        setDomainError(true);
        setUser(null);
        supabase.auth.signOut();
        return;
      }
      setDomainError(false);
      setUser(session.user);
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      apply(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session);
    });

    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: { hd: ALLOWED_DOMAIN, prompt: 'select_account' },
        redirectTo: window.location.origin,
      },
    });

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, loading, domainError, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
