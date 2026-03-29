import { startOfDay, endOfDay } from 'date-fns';
import { supabase } from '@/lib/supabase/client.ts';
import { useAuthStore } from '@/features/auth/store/auth.ts';
import { useCallback, useEffect, useState } from 'react';

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

interface NoteRow {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const DEFAULT_LIMIT = 20;

const mapNote = (note: NoteRow): Note => ({
  id: note.id,
  userId: note.user_id,
  content: note.content,
  createdAt: note.created_at,
  updatedAt: note.updated_at,
});


export const useNotes = () => {
  const session = useAuthStore((state) => state.session);

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const loadNotes = useCallback(async (filter?: NotesFilter) => {
    const selectedDateMs = filter?.date?.getTime();
    const normalizedQuery = filter?.query?.trim() ?? '';
    const limit = filter?.limit ?? DEFAULT_LIMIT;

    let query = supabase
      .from('notes')
      .select('id, user_id, content, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (selectedDateMs !== undefined) {
      const selectedDate = new Date(selectedDateMs);

      query = query
        .gte('created_at', startOfDay(selectedDate).toISOString())
        .lte('created_at', endOfDay(selectedDate).toISOString());
    }

    if (normalizedQuery) {
      query = query.textSearch('search', normalizedQuery, {
        config: 'english',
        type: 'websearch',
      });
    }

    const { data, error: selectError } = await query;

    if (selectError) {
      setNotes([]);
      setError(selectError.message);
      setIsLoading(false);
      return;
    }

    setNotes((data ?? []).map(mapNote));
    setIsLoading(false);
  }, []);

  const createNote = async (content: string) => {
    const userId = session?.user?.id;

    if (!userId) {
      const authError = new Error('You must be signed in to create notes.');
      setError(authError.message);
      throw authError;
    }

    supabase.from('notes').insert({
      content,
      user_id: userId,
    })
  };

  const updateNote = async (id: string, content: string) => {
    supabase
      .from('notes')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
  };

  const deleteNote = async (id: string) => {
    supabase.from('notes').delete().eq('id', id);
  };

  useEffect(() => {
    loadNotes().then();
  }, [loadNotes])

  return {
    notes,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
    loadNotes,
  };
};
