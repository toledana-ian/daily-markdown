import { Navigate, Outlet } from '@tanstack/react-router';
import { Header } from '@/components/shared/header.tsx';
import { Footer } from '@/components/shared/footer.tsx';
import { useAuth } from '@/app/hooks/useAuth.ts';
import { Loading } from '@/features/auth/components/loading.tsx';

export const AuthLayout = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (session) {
    return <Navigate to='/' />;
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <Header showLogin={false} />
      <main className='flex-1'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
