import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import type { Session } from "@supabase/supabase-js";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseAuthMock } from "@/test/mocks/supabase-auth";

const supabaseAuthMock = createSupabaseAuthMock();

const mockSession: Session = {
  access_token: "token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: "refresh-token",
  user: {
    id: "user-id",
    aud: "authenticated",
    app_metadata: {},
    user_metadata: {},
  },
};

let authState = { session: null as Session | null, loading: false };
const navigateTargets: string[] = [];

vi.doMock("@/lib/supabase/client", () => ({
  supabase: {
    auth: supabaseAuthMock.supabaseAuth,
  },
}));

vi.doMock("@/context/auth", () => ({
  useAuth: () => authState,
}));

vi.mock("@tanstack/react-router", () => ({
  Navigate: ({ to }: { to: string }) => {
    navigateTargets.push(to);
    return <div data-testid="login-redirect">{to}</div>;
  },
}));

let LoginPage: ComponentType;

beforeAll(async () => {
  const module = await import("@/features/auth/pages/login");
  LoginPage = module.LoginPage ?? module.default;
});

describe("Login page OAuth trigger", () => {
  beforeEach(() => {
    supabaseAuthMock.controls.reset();
    authState = { session: null, loading: false };
    navigateTargets.length = 0;
  });

  it("renders a Google sign-in button that calls signInWithOAuth with the callback redirect", () => {
    render(<LoginPage />);

    const button = screen.getByRole("button", {
      name: /sign in with google/i,
    });

    fireEvent.click(button);

    expect(supabaseAuthMock.supabaseAuth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: expect.objectContaining({
        redirectTo: expect.stringMatching(/\/auth\/callback$/),
      }),
    });
  });

  it("redirects authenticated users to /dashboard", () => {
    authState = { session: mockSession, loading: false };

    render(<LoginPage />);

    expect(screen.queryByRole("button")).toBeNull();
    expect(navigateTargets).toContain("/dashboard");
    expect(screen.getByTestId("login-redirect")).toHaveTextContent("/dashboard");
  });
});
