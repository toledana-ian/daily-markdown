import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase/client';
import { Loading } from '@/features/auth/components/loading.tsx';
import { useAuthStore } from '@/features/auth/store/auth';

export const LogoutPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    void supabase.auth.signOut().then(() => {
      setSession(null);
      void navigate({ to: '/landing', replace: true });
    });
  }, [navigate, setSession]);

  return <Loading />;
};

export default LogoutPage;
