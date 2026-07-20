import { create } from 'zustand';
import type { Note } from '@/features/notes/hooks/use-notes.ts';

interface NotesState {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  currentPage: number;
  setCurrentPage: (currentPage: number) => void;
  hasMore: boolean;
  setHasMore: (hasMore: boolean) => void;
  protectedNoteIds: Record<string, true>;
  protectNote: (id: string) => void;
  unprotectNote: (id: string) => void;
  clearProtectedNotes: () => void;
}

//========== Store ==========//
export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  setNotes: (notes) => set({ notes }),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
  error: null,
  setError: (error) => set({ error }),
  currentPage: 0,
  setCurrentPage: (currentPage) => set({ currentPage }),
  hasMore: false,
  setHasMore: (hasMore) => set({ hasMore }),
  protectedNoteIds: {},
  protectNote: (id) =>
    set((state) => ({
      protectedNoteIds: { ...state.protectedNoteIds, [id]: true },
    })),
  unprotectNote: (id) =>
    set((state) => {
      const nextProtectedNoteIds = { ...state.protectedNoteIds };
      delete nextProtectedNoteIds[id];
      return { protectedNoteIds: nextProtectedNoteIds };
    }),
  clearProtectedNotes: () => set({ protectedNoteIds: {} }),
}));
