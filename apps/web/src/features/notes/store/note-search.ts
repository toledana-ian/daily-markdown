import { create } from 'zustand';

interface NoteSearchState {
  query: string;
  setQuery: (query: string) => void;
}

export const useNoteSearchStore = create<NoteSearchState>((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
}));
