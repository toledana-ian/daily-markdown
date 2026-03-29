import { startOfDay, endOfDay } from 'date-fns';
import { useEffect, useEffectEvent, useState } from 'react';
import { supabase } from '@/lib/supabase/client.ts';
import { useAuthStore } from '@/features/auth/store/auth.ts';

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

interface LoadNotesParams {
  hasFilter: boolean;
  limit: number;
  normalizedQuery: string;
  selectedDateMs?: number;
}

const loadNotesForFilter = async ({
  hasFilter,
  limit,
  normalizedQuery,
  selectedDateMs,
}: LoadNotesParams) => {
  if (!hasFilter) {
    return {
      data: [] satisfies NoteRow[],
      error: null,
    };
  }

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

  return query;
};

export const useNotes = (filter: NotesFilter) => {
  const session = useAuthStore((state) => state.session);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedDateMs = filter.date?.getTime();
  const normalizedQuery = filter.query?.trim() ?? '';
  const limit = filter.limit ?? DEFAULT_LIMIT;
  const hasFilter = selectedDateMs !== undefined || normalizedQuery.length > 0;

  const reload = async () => {
    if (!hasFilter) {
      setNotes([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: selectError } = await loadNotesForFilter({
      hasFilter,
      limit,
      normalizedQuery,
      selectedDateMs,
    });

    if (selectError) {
      setNotes([]);
      setError(selectError.message);
      setIsLoading(false);
      return;
    }

    setNotes((data ?? []).map(mapNote));
    setIsLoading(false);
  };

  const reloadFromEffect = useEffectEvent(() => {
    void reload();
  });

  useEffect(() => {
    reloadFromEffect();

    if (!hasFilter) {
      return;
    }

    const channel = supabase
      .channel(`notes:realtime:${selectedDateMs ?? normalizedQuery}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
        reloadFromEffect();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [hasFilter, normalizedQuery, selectedDateMs]);

  const runMutation = async (action: () => PromiseLike<{ error: Error | null }>) => {
    setIsMutating(true);
    setError(null);

    const { error: mutationError } = await action();

    if (mutationError) {
      setError(mutationError.message);
      setIsMutating(false);
      throw mutationError;
    }

    await reload();
    setIsMutating(false);
  };

  const createNote = async (content: string) => {
    const userId = session?.user?.id;

    if (!userId) {
      const authError = new Error('You must be signed in to create notes.');
      setError(authError.message);
      throw authError;
    }

    await runMutation(() =>
      supabase.from('notes').insert({
        content,
        user_id: userId,
      }),
    );
  };

  const updateNote = async (id: string, content: string) => {
    await runMutation(() =>
      supabase
        .from('notes')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id),
    );
  };

  const deleteNote = async (id: string) => {
    await runMutation(() => supabase.from('notes').delete().eq('id', id));
  };

  return {
    notes,
    isLoading,
    isMutating,
    error,
    createNote,
    updateNote,
    deleteNote,
    reload,
  };
};
