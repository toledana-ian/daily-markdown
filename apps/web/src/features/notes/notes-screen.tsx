import { useAuth } from '@/features/auth/hooks/useAuth';

export const NotesScreen = () => {
  const { session } = useAuth();
  return (
    <div className='min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center text-center px-6'>
      <span className='font-mono text-primary text-sm mb-4'>#daily.md</span>
      <h1 className='text-4xl font-semibold tracking-tight'>
        Welcome {session ? session.user.email : 'Guest'}
      </h1>
    </div>
  );
};
