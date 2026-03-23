import { render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import type { Session } from '@supabase/supabase-js';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

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

let mockAuthState: { loading: boolean; session: Session | null } = {
  loading: true,
  session: null,
};
const navigateTargets: string[] = [];

vi.mock('@/features/auth/hooks/useAuth.ts', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('@tanstack/react-router', () => ({
  Navigate: ({ to }: { to: string }) => {
    navigateTargets.push(to);
    return <div data-testid='protected-redirect'>{to}</div>;
  },
  Outlet: () => <div data-testid='protected-outlet' />,
}));

let DefaultLayout: ComponentType;

beforeAll(async () => {
  const module = await import('@/app/layouts/DefaultLayout.tsx');
  DefaultLayout = module.DefaultLayout;
});

beforeEach(() => {
  mockAuthState = { loading: true, session: null };
  navigateTargets.length = 0;
});

describe('ProtectedLayout guard states', () => {
  it('shows an empty shell while auth bootstraps', () => {
    mockAuthState = { loading: true, session: null };

    const { container } = render(<DefaultLayout />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId('protected-outlet')).toBeNull();
    expect(screen.queryByTestId('protected-redirect')).toBeNull();
  });

  it('redirects to /landing when auth finishes without a session', () => {
    mockAuthState = { loading: false, session: null };

    render(<DefaultLayout />);

    expect(screen.getByTestId('protected-redirect')).toHaveTextContent('/landing');
    expect(navigateTargets).toContain('/landing');
    expect(screen.queryByTestId('protected-outlet')).toBeNull();
  });

  it('renders its outlet once a session exists', () => {
    mockAuthState = { loading: false, session: mockSession };

    render(<DefaultLayout />);

    expect(screen.getByTestId('protected-outlet')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-redirect')).toBeNull();
  });
});
