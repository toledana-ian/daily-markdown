import { Navigate, Outlet } from '@tanstack/react-router';
import { Header } from '@/components/common/header.tsx';
import { Footer } from '@/components/common/footer.tsx';
import { Sidebar } from '@/components/common/sidebar.tsx';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';
import { useSidebar } from '@/features/sidebar/hooks/useSidebar.ts';

export const DefaultLayout = () => {
  const { session, loading } = useAuth();
  const { toggle, isVisible } = useSidebar();

  if (loading) {
    return <></>;
  }

  if (!session) {
    return <Navigate to='/landing' />;
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <Header session={session} showLogin={true} showMenu={true} onCLickMenu={toggle} />
      <div className='flex flex-1'>
        <Sidebar isVisible={isVisible} />
        <main className='flex-1 min-w-0'>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};
