import { createFileRoute } from '@tanstack/react-router';
import { ProtectedLayout } from '@/app/layouts/ProtectedLayout';

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
});
