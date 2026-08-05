import { create } from 'zustand';
import type { Template } from '@/features/templates/lib/templates';

interface TemplatesState {
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useTemplatesStore = create<TemplatesState>((set) => ({
  templates: [],
  setTemplates: (templates) => set({ templates }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  error: null,
  setError: (error) => set({ error }),
}));
