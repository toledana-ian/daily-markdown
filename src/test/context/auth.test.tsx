import { render, screen, waitFor } from "@testing-library/react";
import type { ComponentType, PropsWithChildren } from "react";
import { type Session } from "@supabase/supabase-js";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseAuthMock } from "@/test/mocks/supabase-auth";

const supabaseAuthMock = createSupabaseAuthMock();

vi.doMock("@/lib/supabase/client", () => ({
  supabase: {
    auth: supabaseAuthMock.supabaseAuth,
  },
}));

let AuthProvider: ComponentType<PropsWithChildren<unknown>>;
let useAuth: () => { session: Session | null; loading: boolean };

beforeAll(async () => {
  const authModule = await import("@/context/auth");
  AuthProvider = authModule.AuthProvider;
  useAuth = authModule.useAuth;
});

const TestConsumer = () => {
  const { loading, session } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? "loading" : "idle"}</div>
      <div data-testid="session">{session ? "has-session" : "no-session"}</div>
    </div>
  );
};

const bootstrapSession: Session = {
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

describe("AuthProvider bootstrap", () => {
  beforeEach(() => {
    supabaseAuthMock.controls.reset();
  });

  it("keeps loading true until getSession resolves and exposes the restored session", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("loading");
    expect(screen.getByTestId("session")).toHaveTextContent("no-session");

    supabaseAuthMock.controls.resolveGetSession(bootstrapSession);

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("idle");
    });

    expect(screen.getByTestId("session")).toHaveTextContent("has-session");
  });

  it("clears loading and stays signed out when getSession rejects", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    supabaseAuthMock.controls.rejectGetSession(new Error("bootstrap failure"));

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("idle");
    });

    expect(screen.getByTestId("session")).toHaveTextContent("no-session");
  });
});

describe("AuthProvider subscription lifecycle", () => {
  beforeEach(() => {
    supabaseAuthMock.controls.reset();
  });

  it("updates session when auth state change events fire", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    supabaseAuthMock.controls.resolveGetSession(null);

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("idle");
    });

    supabaseAuthMock.controls.emitAuthStateChange("SIGNED_IN", bootstrapSession);

    await waitFor(() => {
      expect(screen.getByTestId("session")).toHaveTextContent("has-session");
    });
  });

  it("unsubscribes from auth state changes on unmount", async () => {
    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    supabaseAuthMock.controls.resolveGetSession(null);

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("idle");
    });

    const [subscription] = supabaseAuthMock.controls.getSubscriptions();
    expect(subscription).toBeDefined();

    unmount();

    expect(subscription?.unsubscribe).toHaveBeenCalled();
  });
});
