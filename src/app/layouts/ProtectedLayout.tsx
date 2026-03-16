import { Navigate, Outlet } from '@tanstack/react-router';
import { useAuth } from '@/app/hooks/useAuth';

export const ProtectedLayout = () => {
  const { loading, session } = useAuth();

  if (loading) {
    return <div data-testid='protected-loading'>Loading...</div>;
  }

  if (!session) {
    return <Navigate to='/login' />;
  }

  return <Outlet />;
};
