import { createFileRoute } from '@tanstack/react-router';
import CallbackPage from '@/features/auth/pages/callback';

export const Route = createFileRoute('/_auth/auth/callback')({
  component: CallbackPage,
});
