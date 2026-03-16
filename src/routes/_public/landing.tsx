import { createFileRoute } from '@tanstack/react-router';
import { LandingPage } from '@/features/public/pages/landing.tsx';

export const Route = createFileRoute('/_public/landing')({
  component: LandingPage,
});
