import { Navigate } from '@tanstack/react-router';
import { useAuth } from '@/app/hooks/useAuth.ts';

export const CallbackPage = () => {
  const { session } = useAuth();

  if (session) {
    return <Navigate to='/' />;
  }

  return <Navigate to='/login' />;
};

export default CallbackPage;
