import { act, render, screen } from '@testing-library/react';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from '@supabase/supabase-js';
import { createSupabaseAuthMock } from '@/test/mocks/supabase-auth';
import type { ReactNode } from 'react';

const supabaseAuthMock = createSupabaseAuthMock();

let authState: { session: Session | null; loading: boolean } = {
  session: null,
  loading: false,
};

vi.doMock('@/lib/supabase/client', () => ({
  supabase: {
    auth: supabaseAuthMock.supabaseAuth,
  },
}));

vi.doMock('@/context/auth', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuth: () => authState,
}));

let routeTree: typeof import('@/routeTree.gen').routeTree;

beforeAll(async () => {
  const module = await import('@/routeTree.gen');
  routeTree = module.routeTree;
});

const renderLoginRoute = async () => {
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ['/login'] }),
    routeTree,
  });

  const renderResult = render(<RouterProvider router={router} />);

  await act(async () => {
    await router.load();
  });

  return renderResult;
};

describe('/login route', () => {
  beforeEach(() => {
    supabaseAuthMock.controls.reset();
    authState = { session: null, loading: false };
  });

  it('renders the login page through the file route', async () => {
    await renderLoginRoute();

    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });
});
