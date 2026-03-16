import { Outlet } from '@tanstack/react-router';
import { Header } from '@/components/shared/header.tsx';
import { Footer } from '@/components/shared/footer.tsx';

export const AuthLayout = () => {
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
