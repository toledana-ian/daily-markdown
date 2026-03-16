import { Outlet } from '@tanstack/react-router';
import { Header } from '@/components/shared/header.tsx';
import { Footer } from '@/components/shared/footer.tsx';

export const PublicLayout = () => {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header showLogin={true} />
      <main className='flex-1'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
