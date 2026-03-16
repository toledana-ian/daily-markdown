import { render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import type { Session } from '@supabase/supabase-js';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const navigateTargets: string[] = [];
let mockAuthState: { loading: boolean; session: Session | null } = {
  loading: true,
  session: null,
};

vi.mock('@/context/auth', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('@tanstack/react-router', () => ({
  Navigate: ({ to }: { to: string }) => {
    navigateTargets.push(to);
    return <div data-testid='callback-redirect'>{to}</div>;
  },
}));

let CallbackPage: ComponentType;

beforeAll(async () => {
  const module = await import('@/features/auth/pages/callback');
  CallbackPage = module.CallbackPage ?? module.default;
});

beforeEach(() => {
  mockAuthState = { loading: true, session: null };
  navigateTargets.length = 0;
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

describe('Callback page auth state machine', () => {
  it('shows a loading shell while auth bootstraps', () => {
    mockAuthState = { loading: true, session: null };

    render(<CallbackPage />);

    expect(screen.getByTestId('callback-loading')).toBeInTheDocument();
    expect(navigateTargets).toHaveLength(0);
  });

  it('navigates to /dashboard when a session resolves', () => {
    mockAuthState = { loading: false, session: mockSession };

    render(<CallbackPage />);

    expect(screen.getByTestId('callback-redirect')).toHaveTextContent('/dashboard');
    expect(navigateTargets).toContain('/dashboard');
  });

  it('navigates to /login when auth settles without a session', () => {
    mockAuthState = { loading: false, session: null };

    render(<CallbackPage />);

    expect(screen.getByTestId('callback-redirect')).toHaveTextContent('/login');
    expect(navigateTargets).toContain('/login');
  });
});
