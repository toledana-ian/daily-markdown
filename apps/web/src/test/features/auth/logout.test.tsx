import { render, screen, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ComponentType } from 'react';

const navigateMock = vi.fn();
const signOutMock = vi.fn();
const setSessionMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signOut: signOutMock,
    },
  },
}));

vi.mock('@/features/auth/store/auth', () => ({
  useAuthStore: (selector: (state: { setSession: typeof setSessionMock }) => unknown) =>
    selector({ setSession: setSessionMock }),
}));

let LogoutPage: ComponentType;

beforeAll(async () => {
  const module = await import('@/features/auth/pages/logout.tsx');
  LogoutPage = module.LogoutPage;
});

beforeEach(() => {
  navigateMock.mockReset();
  signOutMock.mockReset();
  setSessionMock.mockReset();
  signOutMock.mockResolvedValue({ error: null });
});

describe('LogoutPage', () => {
  it('signs out, clears local session state, and replaces to /landing', async () => {
    render(<LogoutPage />);

    expect(screen.getByText(/finalizing sign in/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalledTimes(1);
      expect(setSessionMock).toHaveBeenCalledWith(null);
      expect(navigateMock).toHaveBeenCalledWith({ to: '/landing', replace: true });
    });
  });
});
