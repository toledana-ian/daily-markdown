import { act, render, screen } from "@testing-library/react";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseAuthMock } from "@/test/mocks/supabase-auth";

const supabaseAuthMock = createSupabaseAuthMock();

vi.doMock("@/lib/supabase/client", () => ({
  supabase: {
    auth: supabaseAuthMock.supabaseAuth,
  },
}));

vi.doMock("@/features/home/pages", async () => {
  const { useAuth } = await import("@/app/context/auth.tsx");

  const AuthAwareHomePage = () => {
    const { loading } = useAuth();

    return (
      <div data-testid="root-auth-state">
        {loading ? "loading" : "idle"}
      </div>
    );
  };

  return {
    HomePage: AuthAwareHomePage,
  };
});

let routeTree: typeof import("@/routeTree.gen").routeTree;

beforeAll(async () => {
  const module = await import("@/routeTree.gen");
  routeTree = module.routeTree;
});

const renderRoot = async () => {
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ["/"] }),
    routeTree,
  });

  const renderResult = render(<RouterProvider router={router} />);

  await act(async () => {
    await router.load();
  });

  return renderResult;
};

describe("Root route auth wiring", () => {
  beforeEach(() => {
    supabaseAuthMock.controls.reset();
  });

  it("provides auth context to route descendants", async () => {
    await renderRoot();

    expect(screen.getByTestId("root-auth-state")).toHaveTextContent("loading");
  });
});
