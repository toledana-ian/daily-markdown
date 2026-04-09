import { supabase } from '@/lib/supabase/client.ts';
import { useAuthStore } from '@/features/auth/store/auth.ts';
import { useTagsStore } from '@/features/tags/store/tags.ts';
import { useCallback } from 'react';

//========== Types ==========//
type TagRow = { name: string };

//========== Hook ==========//
export const useTags = () => {
  //========== Store States ==========//
  const session = useAuthStore((state) => state.session);
  const tags = useTagsStore((state) => state.tags);
  const isLoading = useTagsStore((state) => state.isLoading);
  const error = useTagsStore((state) => state.error);

  //========== Store Functions ==========//
  const setTags = useTagsStore((state) => state.setTags);
  const setIsLoading = useTagsStore((state) => state.setIsLoading);
  const setError = useTagsStore((state) => state.setError);

  //========== Callbacks ==========//
  const loadTags = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc('get_user_tags');

    if (rpcError) {
      setError(rpcError.message);
      setIsLoading(false);
      return;
    }

    setTags((data ?? []).map((row: TagRow) => row.name));
    setIsLoading(false);
  }, [session?.user?.id, setError, setIsLoading, setTags]);

  return {
    tags,
    isLoading,
    error,
    loadTags,
  };
};
