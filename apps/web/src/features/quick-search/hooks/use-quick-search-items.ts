import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client.ts';
import { useAuthStore } from '@/features/auth/store/auth.ts';
import { useQuickSearchItemsStore } from '@/features/quick-search/store/quick-search-items.ts';
import { useCallback } from 'react';

type QuickSearchItemRow = { value: string };

export const useQuickSearchItems = () => {
  const session = useAuthStore((state) => state.session);
  const items = useQuickSearchItemsStore((state) => state.items);
  const isLoading = useQuickSearchItemsStore((state) => state.isLoading);
  const error = useQuickSearchItemsStore((state) => state.error);
  const setItems = useQuickSearchItemsStore((state) => state.setItems);
  const setIsLoading = useQuickSearchItemsStore((state) => state.setIsLoading);
  const setError = useQuickSearchItemsStore((state) => state.setError);

  const loadItems = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('quick_search_items')
      .select('value')
      .order('created_at', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    setItems((data ?? []).map((row: QuickSearchItemRow) => row.value));
    setIsLoading(false);
  }, [session?.user?.id, setError, setIsLoading, setItems]);

  const addItem = useCallback(async (value: string) => {
    const userId = session?.user?.id;
    const trimmed = value.trim();
    if (!userId || !trimmed) return;

    setItems([...items, trimmed]);

    const { error: insertError } = await supabase
      .from('quick_search_items')
      .insert({ user_id: userId, value: trimmed });

    if (insertError) {
      setItems(items.filter((i) => i !== trimmed));
      toast.error('Failed to add quick search item');
    }
  }, [session?.user?.id, items, setItems]);

  const removeItem = useCallback(async (value: string) => {
    const userId = session?.user?.id;
    if (!userId) return;

    const previousItems = items;
    setItems(items.filter((item) => item !== value));

    const { error: deleteError } = await supabase
      .from('quick_search_items')
      .delete()
      .eq('value', value)
      .eq('user_id', userId);

    if (deleteError) {
      setItems(previousItems);
      toast.error('Failed to remove quick search item');
    }
  }, [session?.user?.id, items, setItems]);

  return {
    items,
    isLoading,
    error,
    loadItems,
    addItem,
    removeItem,
  };
};
