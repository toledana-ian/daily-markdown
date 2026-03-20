import { createRootRoute, Outlet } from '@tanstack/react-router';
import { type PropsWithChildren } from 'react';
import { AuthProvider } from '@/app/providers/auth';
import { NotFoundPage } from '@/features/marketing/pages/not-found.tsx';

const AuthShell = ({ children }: PropsWithChildren) => <AuthProvider>{children}</AuthProvider>;

const RootLayout = () => <Outlet />;

export const Route = createRootRoute({
  component: RootLayout,
  shellComponent: AuthShell,
  notFoundComponent: NotFoundPage,
});
