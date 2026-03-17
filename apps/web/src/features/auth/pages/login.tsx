import { Navigate } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth';

const getCallbackRedirect = () => {
  if (typeof window === 'undefined') {
    return '/auth/callback';
  }
  return `${window.location.origin}/auth/callback`;
};

export const LoginPage = () => {
  const { session } = useAuth();

  const handleGoogleSignIn = () => {
    void supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getCallbackRedirect(),
      },
    });
  };

  if (session) {
    return <Navigate to='/dashboard' />;
  }

  return (
    <div className='min-h-[calc(100vh-7rem)] flex items-center justify-center px-6'>
      <div className='w-full max-w-sm bg-card border border-border rounded-lg p-8 flex flex-col items-center gap-4'>
        <div className='text-center'>
          <h1 className='text-xl font-semibold'>Welcome back</h1>
          <p className='text-sm text-muted-foreground mt-1'>Sign in to continue</p>
        </div>
        <button className='w-full gap-2 border rounded px-4 py-2' onClick={handleGoogleSignIn}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
