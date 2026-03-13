import { createRootRoute } from '@tanstack/react-router'
import { DefaultLayout } from '@/layouts/DefaultLayout'

export const Route = createRootRoute({
  component: DefaultLayout,
})
