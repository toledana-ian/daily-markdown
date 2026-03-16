import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase/client';

export const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    void supabase.auth.signOut().then(() => {
      void navigate({ to: '/' });
    });
  }, [navigate]);

  return null;
};

export default LogoutPage;
