import { act, render, screen } from '@testing-library/react';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { createSupabaseAuthMock } from '@/test/mocks/supabase-auth';

const supabaseAuthMock = createSupabaseAuthMock();

vi.doMock('@/lib/supabase/client', () => ({
  supabase: {
    auth: supabaseAuthMock.supabaseAuth,
  },
}));

vi.doMock('@/app/layouts/ProtectedLayout', () => ({
  ProtectedLayout: ({ children }: { children: ReactNode }) => (
    <div data-testid="protected-layout">{children}</div>
  ),
}));

let routeTree: typeof import('@/routeTree.gen').routeTree;

beforeAll(async () => {
  const module = await import('@/routeTree.gen');
  routeTree = module.routeTree;
});

const renderProtectedRoute = async (path = '/dashboard') => {
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: [path] }),
    routeTree,
  });

  const renderResult = render(<RouterProvider router={router} />);

  await act(async () => {
    await router.load();
  });

  return renderResult;
};

describe('Protected layout route wiring', () => {
  beforeEach(() => {
    supabaseAuthMock.controls.reset();
  });

  it('renders ProtectedLayout for the /dashboard child route', async () => {
    await renderProtectedRoute();

    expect(screen.getByTestId('protected-layout')).toBeInTheDocument();
  });
});
