import { act, render, screen } from '@testing-library/react';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { createSupabaseAuthMock } from '@/test/mocks/supabase-auth';

const supabaseAuthMock = createSupabaseAuthMock();
const navigateTargets: string[] = [];

vi.doMock('@/lib/supabase/client', () => ({
  supabase: {
    auth: supabaseAuthMock.supabaseAuth,
  },
}));

let authState: { session: Session | null; loading: boolean } = {
  session: null,
  loading: false,
};

vi.doMock('@/context/auth', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuth: () => authState,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');

  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => {
      navigateTargets.push(to);
      return <div data-testid='protected-dashboard-redirect'>{to}</div>;
    },
  };
});

let routeTree: typeof import('@/routeTree.gen').routeTree;

beforeAll(async () => {
  const module = await import('@/routeTree.gen');
  routeTree = module.routeTree;
});

const mockSession: Session = {
  access_token: 'token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'refresh-token',
  user: {
    id: 'user-id',
    aud: 'authenticated',
    created_at: '',
    app_metadata: {},
    user_metadata: {},
  },
};

const renderDashboardRoute = async () => {
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ['/dashboard'] }),
    routeTree,
  });

  const renderResult = render(<RouterProvider router={router} />);

  await act(async () => {
    await router.load();
  });

  return renderResult;
};

describe('Protected dashboard route', () => {
  beforeEach(() => {
    supabaseAuthMock.controls.reset();
    authState = { session: null, loading: false };
    navigateTargets.length = 0;
  });

  it('redirects unauthenticated visitors to /login', async () => {
    await renderDashboardRoute();

    expect(screen.getByTestId('protected-dashboard-redirect')).toHaveTextContent('/login');
    expect(navigateTargets).toContain('/login');
    expect(screen.queryByRole('heading', { name: /dashboard/i })).toBeNull();
  });

  it('renders the dashboard page for authenticated visitors', async () => {
    authState = { session: mockSession, loading: false };

    await renderDashboardRoute();

    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    expect(navigateTargets).toHaveLength(0);
    expect(screen.queryByTestId('protected-dashboard-redirect')).toBeNull();
  });
});
