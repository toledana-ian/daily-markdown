import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase/client';
import { Loading } from '@/features/auth/components/loading.tsx';

export const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    void supabase.auth.signOut().then(() => {
      void navigate({ to: '/' });
    });
  }, [navigate]);

  return <Loading />;
};

export default LogoutPage;
