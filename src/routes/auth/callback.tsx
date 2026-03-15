import { createFileRoute } from '@tanstack/react-router';
import CallbackPage from '@/features/auth/pages/callback';

export const Route = createFileRoute('/auth/callback')({
  component: CallbackPage,
});
