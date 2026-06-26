import { create } from 'zustand';

interface QuickSearchItemsState {
  items: string[];
  setItems: (items: string[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useQuickSearchItemsStore = create<QuickSearchItemsState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  error: null,
  setError: (error) => set({ error }),
}));
