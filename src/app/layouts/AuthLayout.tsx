import { Header } from '@/components/shared/header.tsx';
import { Footer } from '@/components/shared/footer.tsx';
import { useAuth } from '@/app/hooks/useAuth.ts';
import { Loading } from '@/features/auth/components/loading.tsx';
import { Outlet } from '@tanstack/react-router';

export const AuthLayout = () => {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <main className='flex-1'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
