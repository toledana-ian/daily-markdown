import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from '@/features/auth/pages';

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})
