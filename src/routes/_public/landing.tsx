import { createFileRoute } from '@tanstack/react-router';
import { LandingPage } from '@/features/marketing/pages/landing-screen.tsx';

export const Route = createFileRoute('/_public/landing')({
  component: LandingPage,
});
