import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

import { SignInButton } from './signin-button';

function withRouter(children: React.ReactNode) {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <>{children}</>,
  });
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: () => <div className='p-6 text-sm'>Login route preview</div>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([homeRoute, loginRoute]),
    history: createMemoryHistory({
      initialEntries: ['/'],
    }),
  });

  return <RouterProvider router={router} />;
}

const meta = {
  title: 'Features/Auth/SignInButton',
  component: SignInButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [(Story) => withRouter(<Story />)],
} satisfies Meta<typeof SignInButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
