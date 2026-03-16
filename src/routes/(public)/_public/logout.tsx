import { createFileRoute } from '@tanstack/react-router';
import LogoutPage from '@/features/auth/pages/logout';

export const Route = createFileRoute('/(public)/_public/logout')({
  component: LogoutPage,
});
