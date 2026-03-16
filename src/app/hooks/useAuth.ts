import { useAuthStore } from '@/app/stores/auth';

export const useAuth = () => {
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  return { session, loading };
};
