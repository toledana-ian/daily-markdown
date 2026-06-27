import { type PropsWithChildren, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/store/auth';

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const setSession = useAuthStore((s) => s.setSession);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    let mounted = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (!mounted) return;
      setSession(session);
    });

    const bootstrapSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) {
          throw error;
        }
        setSession(data.session);
      } catch {
        if (!mounted) return;
        setSession(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrapSession().then();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [setSession, setLoading]);

  return <>{children}</>;
};
