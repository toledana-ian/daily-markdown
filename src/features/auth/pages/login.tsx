import { Navigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth";

const getCallbackRedirect = () => {
  if (typeof window === "undefined") {
    return "/auth/callback";
  }

  return `${window.location.origin}/auth/callback`;
};

export const LoginPage = () => {
  const { session, loading } = useAuth();

  const handleGoogleSignIn = () => {
    void supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getCallbackRedirect(),
      },
    });
  };

  if (loading) {
    return null;
  }

  if (session) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <main>
      <button type="button" onClick={handleGoogleSignIn}>
        Sign in with Google
      </button>
    </main>
  );
};

export default LoginPage;
