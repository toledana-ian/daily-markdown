import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSidebarStore } from '@/features/sidebar/store/sidebar.ts';

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

let mockAuthState: { session: Session | null } = {
  session: mockSession,
};
const navigateTargets: string[] = [];

vi.mock('@/features/auth/hooks/useAuth.ts', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('@/features/auth/components/user-avatar.tsx', () => ({
  UserAvatar: () => <div data-testid='user-avatar' />,
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    className,
    ...props
  }: {
    to: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  ),
  Navigate: ({ to }: { to: string }) => {
    navigateTargets.push(to);
    return <div data-testid='default-layout-redirect'>{to}</div>;
  },
  Outlet: () => <div data-testid='default-layout-outlet' />,
}));

let DefaultLayout: ComponentType;

beforeAll(async () => {
  const module = await import('@/app/layouts/DefaultLayout.tsx');
  DefaultLayout = module.DefaultLayout;
});

beforeEach(() => {
  mockAuthState = { session: mockSession };
  navigateTargets.length = 0;
  useSidebarStore.setState({ isVisible: false });
});

describe('DefaultLayout authenticated navigation', () => {
  it('renders the updated sidebar content for authenticated pages', () => {
    render(<DefaultLayout />);

    expect(screen.getByRole('navigation', { name: /app sidebar/i })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /search notes/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/sidebar calendar/i)).toBeInTheDocument();
    expect(screen.getByText('HASHTAGS')).toBeInTheDocument();
    expect(screen.getByText('#work')).toBeInTheDocument();
    expect(screen.getByText('#ideas')).toBeInTheDocument();
    expect(screen.getByText('#journal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /notes/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('default-layout-outlet')).toBeInTheDocument();
  });

  it('opens a mobile drawer when the header menu button is clicked', () => {
    render(<DefaultLayout />);

    expect(screen.queryByRole('dialog', { name: /sidebar navigation/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /toggle sidebar/i }));

    expect(screen.getByRole('dialog', { name: /sidebar navigation/i })).toBeInTheDocument();
  });

  it('redirects guests to /landing', () => {
    mockAuthState = { session: null };

    render(<DefaultLayout />);

    expect(screen.getByTestId('default-layout-redirect')).toHaveTextContent('/landing');
    expect(navigateTargets).toContain('/landing');
  });
});
