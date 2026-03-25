import { Navigate, Outlet } from '@tanstack/react-router';
import { Header } from '@/components/common/header.tsx';
import { Sidebar } from '@/components/common/sidebar.tsx';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';
import { useSidebar } from '@/features/sidebar/hooks/useSidebar.ts';
import { useTailwindScreen } from '@/hooks/useTailwindScreen.ts';
import { useEffect } from 'react';
import { Loading } from '@/features/auth/components/loading.tsx';
import { useNoteDateStore } from '@/features/notes/store/note-date.ts';
import { useNoteSearchStore } from '@/features/notes/store/note-search.ts';

export const DefaultLayout = () => {
  const { session, loading } = useAuth();
  const { toggle, isVisible, setVisible } = useSidebar();

  const selectedDate = useNoteDateStore((state) => state.selectedDate);
  const setSelectedDate = useNoteDateStore((state) => state.setSelectedDate);
  const query = useNoteSearchStore((state) => state.query);
  const setQuery = useNoteSearchStore((state) => state.setQuery);

  const tailwindScreen = useTailwindScreen();

  useEffect(() => {
    if (['base', 'sm'].indexOf(tailwindScreen) !== -1) setVisible(false);
    else setVisible(true);
  }, [setVisible, tailwindScreen]);

  if (loading) {
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
  }

  if (!session) {
    return <Navigate to='/landing' replace={true} />;
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <Header session={session} showLogin={true} showMenu={true} onCLickMenu={toggle} />
      <div className='flex flex-1'>
        <Sidebar
          isVisible={isVisible}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          query={query}
          setQuery={setQuery}
        />
        <main className='flex-1 min-w-0 p-4 flex flex-col gap-8'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
