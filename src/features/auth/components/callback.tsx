import { Navigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const CallbackPage = () => {
  const { session } = useAuth();

  if (session) {
    return <Navigate to='/' />;
  }

  return <Navigate to='/login' />;
};

export default CallbackPage;
