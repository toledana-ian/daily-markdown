import { Outlet } from '@tanstack/react-router';
import { Header } from '@/components/shared/header.tsx';
import { Footer } from '@/components/shared/footer.tsx';
import { useAuth } from '@/app/hooks/useAuth.ts';

export const DefaultLayout = () => {
  const { session, loading } = useAuth();

  return (
    <div className='min-h-screen flex flex-col'>
      <Header session={session} showLogin={!loading} />
      <main className='flex-1'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
