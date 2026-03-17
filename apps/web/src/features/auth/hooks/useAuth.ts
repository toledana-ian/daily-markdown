import { useAuthStore } from '@/features/auth/store/auth';

export const useAuth = () => {
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  return { session, loading };
};
