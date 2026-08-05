import { create } from 'zustand';
import type { NoteTemplate } from '@/features/notes/lib/note-templates';

interface NoteTemplatesState {
  templates: NoteTemplate[];
  setTemplates: (templates: NoteTemplate[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useNoteTemplatesStore = create<NoteTemplatesState>((set) => ({
  templates: [],
  setTemplates: (templates) => set({ templates }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  error: null,
  setError: (error) => set({ error }),
}));
