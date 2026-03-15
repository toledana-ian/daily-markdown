import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import type { Session } from "@supabase/supabase-js";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

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

let mockAuthState: { loading: boolean; session: Session | null } = {
  loading: true,
  session: null,
};
const navigateTargets: string[] = [];

vi.mock("@/context/auth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("@tanstack/react-router", () => ({
  Navigate: ({ to }: { to: string }) => {
    navigateTargets.push(to);
    return <div data-testid="protected-redirect">{to}</div>;
  },
  Outlet: () => <div data-testid="protected-outlet" />,
}));

let ProtectedLayout: ComponentType;

beforeAll(async () => {
  const module = await import("./ProtectedLayout");
  ProtectedLayout = module.ProtectedLayout;
});

beforeEach(() => {
  mockAuthState = { loading: true, session: null };
  navigateTargets.length = 0;
});

describe("ProtectedLayout guard states", () => {
  it("shows a loading shell while auth bootstraps", () => {
    mockAuthState = { loading: true, session: null };

    render(<ProtectedLayout />);

    expect(screen.getByTestId("protected-loading")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-outlet")).toBeNull();
    expect(screen.queryByTestId("protected-redirect")).toBeNull();
  });

  it("redirects to /login when auth finishes without a session", () => {
    mockAuthState = { loading: false, session: null };

    render(<ProtectedLayout />);

    expect(screen.getByTestId("protected-redirect")).toHaveTextContent("/login");
    expect(navigateTargets).toContain("/login");
    expect(screen.queryByTestId("protected-outlet")).toBeNull();
  });

  it("renders its outlet once a session exists", () => {
    mockAuthState = { loading: false, session: mockSession };

    render(<ProtectedLayout />);

    expect(screen.getByTestId("protected-outlet")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-redirect")).toBeNull();
    expect(screen.queryByTestId("protected-loading")).toBeNull();
  });
});
