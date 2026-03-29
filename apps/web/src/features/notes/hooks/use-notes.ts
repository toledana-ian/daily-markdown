import { supabase } from '@/lib/supabase/client.ts';
import { useAuthStore } from '@/features/auth/store/auth.ts';
import { useNotesStore } from '@/features/notes/store/notes.ts';

export interface Note {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotesFilter {
  date?: Date | null;
  query?: string;
  limit?: number;
}

export const useNotes = () => {
  //========== Store States==========//
  const session = useAuthStore((state) => state.session);
  const notes = useNotesStore((state) => state.notes);
  const isLoading = useNotesStore((state) => state.isLoading);
  const error = useNotesStore((state) => state.error);
  const currentPage = useNotesStore((state) => state.currentPage);
  const hasMore = useNotesStore((state) => state.hasMore);

  //========== Store Functions==========//
  const loadNotes = useNotesStore((state) => state.loadNotes);

  const createNote = async (content: string) => {
    const userId = session?.user?.id;

    if (!userId) {
      const authError = new Error('You must be signed in to create notes.');
      useNotesStore.setState({ error: authError.message });
      throw authError;
    }

    supabase.from('notes').insert({
      content,
      user_id: userId,
    });
  };

  const updateNote = async (id: string, content: string) => {
    supabase
      .from('notes')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  };

  const deleteNote = async (id: string) => {
    supabase.from('notes').delete().eq('id', id);
  };

  //========== useEffects ==========//

  return {
    notes,
    isLoading,
    error,
    hasMore,
    currentPage,
    createNote,
    updateNote,
    deleteNote,
    loadNotes,
  };
};
