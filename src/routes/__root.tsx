import { createRootRoute } from '@tanstack/react-router'
import { type PropsWithChildren } from 'react'
import { AuthProvider } from '@/app/providers/auth'
import { DefaultLayout } from '@/app/layouts/DefaultLayout'
import { NotFoundPage } from '@/features/home/pages/404'

const AuthShell = ({ children }: PropsWithChildren) => (
  <AuthProvider>{children}</AuthProvider>
)

export const Route = createRootRoute({
  component: DefaultLayout,
  shellComponent: AuthShell,
  notFoundComponent: NotFoundPage,
})
