import { createFileRoute } from '@tanstack/react-router';
import LogoutPage from '@/features/auth/pages/logout';

export const Route = createFileRoute('/_public/(auth)/logout')({
  component: LogoutPage,
});
