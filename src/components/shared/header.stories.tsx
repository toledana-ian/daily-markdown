import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import { Header } from './header';

function withRouter(children: React.ReactNode) {
  const rootRoute = createRootRoute({ component: () => <>{children}</> });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory(),
  });
  return <RouterProvider router={router} />;
}

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
