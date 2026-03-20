import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { Sidebar } from './sidebar';

function withRouter(children: ReactNode) {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <>{children}</>,
  });
  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: () => <>{children}</>,
  });
  const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: ['/'],
    }),
  });

  return <RouterProvider router={router} />;
}

const meta = {
  title: 'Shared/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [(Story) => <div className='min-h-screen bg-muted p-6'>{withRouter(<Story />)}</div>],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isVisible: true,
  },
};
