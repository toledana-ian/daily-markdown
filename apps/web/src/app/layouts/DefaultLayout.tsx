import { Navigate, Outlet } from '@tanstack/react-router';
import { Header } from '@/components/common/header.tsx';
import { Footer } from '@/components/common/footer.tsx';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';

export const DefaultLayout = () => {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to='/landing' />;
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <Header session={session} showLogin={true} showMenu={true} />
      <main className='flex-1'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
