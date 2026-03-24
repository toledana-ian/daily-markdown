import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

import { UserAvatar } from './user-avatar';

function withRouter(children: React.ReactNode) {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <>{children}</>,
  });
  const logoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/logout',
    component: () => <div className='p-6 text-sm'>Logout route preview</div>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([homeRoute, logoutRoute]),
    history: createMemoryHistory({
      initialEntries: ['/'],
    }),
  });

  return <RouterProvider router={router} />;
}

const meta = {
  title: 'Features/Auth/UserAvatar',
  component: UserAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [(Story) => withRouter(<Story />)],
} satisfies Meta<typeof UserAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  args: {
    profilePicture: 'https://i.pravatar.cc/96?img=22',
  },
};

export const FallbackOnly: Story = {
  args: {
    profilePicture: null,
  },
};
