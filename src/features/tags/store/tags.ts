import { create } from 'zustand';

interface TagsState {
  tags: string[];
  setTags: (tags: string[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

//========== Store ==========//
export const useTagsStore = create<TagsState>((set) => ({
  tags: [],
  setTags: (tags) => set({ tags }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  error: null,
  setError: (error) => set({ error }),
}));
