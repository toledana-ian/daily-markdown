import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Session } from '@supabase/supabase-js';
import {
  Outlet,
  createRoute,
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import { Header } from './header';

function withRouter(children: React.ReactNode) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <>{children}</>,
  });
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: () => <>{children}</>,
  });
  const logoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/logout',
    component: () => <>{children}</>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([homeRoute, loginRoute, logoutRoute]),
    history: createMemoryHistory(),
  });
  return <RouterProvider router={router} />;
}

const sampleSession = {
  access_token: 'sample-access-token',
  refresh_token: 'sample-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: 1_774_000_000,
  user: {
    id: 'storybook-user-1',
    app_metadata: {
      provider: 'google',
      providers: ['google'],
    },
    user_metadata: {
      avatar_url: 'https://i.pravatar.cc/96?img=15',
      full_name: 'Storybook User',
    },
    aud: 'authenticated',
    created_at: '2026-03-24T00:00:00.000Z',
  },
} as Session;

const meta = {
  title: 'Shared/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    showLogin: { control: 'boolean' },
  },
  decorators: [(Story) => withRouter(<Story />)],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLogin: Story = {
  args: { showLogin: true },
};

export const WithoutLogin: Story = {
  args: { showLogin: false },
};

export const Authenticated: Story = {
  args: {
    showLogin: true,
    session: sampleSession,
  },
};

export const AuthenticatedWithMenu: Story = {
  args: {
    showLogin: true,
    showMenu: true,
    session: sampleSession,
  },
};
