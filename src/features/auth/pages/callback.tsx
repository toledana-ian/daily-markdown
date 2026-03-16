import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/app/hooks/useAuth";

export const CallbackPage = () => {
  const { loading, session } = useAuth();

  if (loading) {
    return <div data-testid="callback-loading">Finalizing sign in…</div>;
  }

  if (session) {
    return <Navigate to="/dashboard" />;
  }

  return <Navigate to="/login" />;
};

export default CallbackPage;
