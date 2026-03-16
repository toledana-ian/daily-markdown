import { createFileRoute } from '@tanstack/react-router'
import { PublicLayout } from '@/app/layouts/PublicLayout'

export const Route = createFileRoute('/(public)/_public')({
    component: PublicLayout,
})
