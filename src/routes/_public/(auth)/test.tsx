import { createFileRoute } from '@tanstack/react-router'
import { TestPage } from '@/features/auth/pages/test'

export const Route = createFileRoute('/_public/(auth)/test')({
  component: TestPage,
})