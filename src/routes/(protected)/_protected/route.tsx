import { createFileRoute } from "@tanstack/react-router";
import { ProtectedLayout } from "@/app/layouts/ProtectedLayout";

export const Route = createFileRoute("/(protected)/_protected")({
  component: ProtectedLayout,
});
