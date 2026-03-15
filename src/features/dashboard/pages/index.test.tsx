import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { beforeAll, describe, expect, it } from "vitest";

let DashboardPage: ComponentType;

beforeAll(async () => {
  const module = await import("./index");
  DashboardPage = module.DashboardPage ?? module.default;
});

describe("Dashboard page content", () => {
  it("renders the authenticated heading and summary copy", () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole("heading", { name: /dashboard/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/welcome to your dashboard/i),
    ).toBeInTheDocument();
  });
});
