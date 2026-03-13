import { createRootRoute } from '@tanstack/react-router'
import { DefaultLayout } from '@/app/layouts/DefaultLayout'
import { NotFoundPage } from '@/features/home/pages/404'

export const Route = createRootRoute({
  component: DefaultLayout,
  notFoundComponent: NotFoundPage,
})
