import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '@/app/layouts/AuthLayout.tsx';

export const Route = createFileRoute('/_auth')({
    component: AuthLayout,
})
