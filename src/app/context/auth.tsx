/* eslint-disable react-refresh/only-export-components */
import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';

export interface AuthContextValue {
  session: Session | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export { AuthProvider } from '@/app/providers/auth';
export { useAuth } from '@/app/hooks/useAuth';
