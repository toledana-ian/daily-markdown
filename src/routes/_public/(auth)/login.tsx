import { createFileRoute } from '@tanstack/react-router'
import LoginPage from '@/features/auth/pages/login'

export const Route = createFileRoute('/_public/(auth)/login')({
    component: LoginPage,
})
