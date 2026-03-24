import { Navigate, Outlet } from '@tanstack/react-router';
import { Header } from '@/components/common/header.tsx';
import { Sidebar } from '@/components/common/sidebar.tsx';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';
import { useSidebar } from '@/features/sidebar/hooks/useSidebar.ts';
import { useTailwindScreen } from '@/hooks/useTailwindScreen.ts';
import { useEffect } from 'react';
import { Loading } from '@/features/auth/components/loading.tsx';

export const DefaultLayout = () => {
  const { session, loading } = useAuth();
  const { toggle, isVisible, setVisible } = useSidebar();
  const tailwindScreen = useTailwindScreen();

  // manage how to display sidebar based on screen size
  useEffect(() => {
    if (['base', 'sm'].indexOf(tailwindScreen) !== -1) setVisible(false);
    else setVisible(true);
  }, [setVisible, tailwindScreen]);

  if (loading) {
    return <RenderLoading />;
  }

  if (!session) {
    return <Navigate to='/landing' replace={true} />;
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <Header session={session} showLogin={true} showMenu={true} onCLickMenu={toggle} />
      <div className='flex flex-1'>
        <Sidebar isVisible={isVisible} />
        <main className='flex-1 min-w-0 p-4'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const RenderLoading = () => {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <div className='flex flex-1'>
        <main className='flex-1 min-w-0 p-4'>
          <Loading />
        </main>
      </div>
    </div>
  );
};
