import { createRootRoute, Outlet } from '@tanstack/react-router';
import { type PropsWithChildren } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/app/providers/auth';
import { NotFoundPage } from '@/features/marketing/pages/not-found.tsx';

const AuthShell = ({ children }: PropsWithChildren) => <AuthProvider>{children}</AuthProvider>;

const RootLayout = () => (
  <>
    <Outlet />
    <Toaster richColors position='bottom-right' />
  </>
);

export const Route = createRootRoute({
  component: RootLayout,
  shellComponent: AuthShell,
  notFoundComponent: NotFoundPage,
});
