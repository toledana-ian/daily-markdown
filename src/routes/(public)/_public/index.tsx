import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@/features/home/pages'

export const Route = createFileRoute('/(public)/_public/')({
    component: HomePage,
})
