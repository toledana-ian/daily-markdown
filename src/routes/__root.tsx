import { createRootRoute } from '@tanstack/react-router'
import { DefaultLayout } from '@/app/layouts/DefaultLayout'

export const Route = createRootRoute({
  component: DefaultLayout,
})
