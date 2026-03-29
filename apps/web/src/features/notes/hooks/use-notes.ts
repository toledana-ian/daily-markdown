import { supabase } from '@/lib/supabase/client.ts';
import { useAuthStore } from '@/features/auth/store/auth.ts';
import { useNotesStore } from '@/features/notes/store/notes.ts';
import { endOfDay, startOfDay } from 'date-fns';
import { useCallback } from 'react';

//========== Constants ==========//
const DEFAULT_LIMIT = 10;

//========== Types ==========//
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

interface NormalizedNotesFilter {
  dateMs?: number;
  query: string;
  limit: number;
}

interface PaginationOptions {
  page?: number;
  append?: boolean;
}

//========== Helpers ==========//

const normalizeFilter = (filter?: NotesFilter): NormalizedNotesFilter => ({
  dateMs: filter?.date?.getTime(),
  query: filter?.query?.trim() ?? '',
  limit: filter?.limit ?? DEFAULT_LIMIT,
});

const mapNote = (note: NoteRow): Note => ({
  id: note.id,
  userId: note.user_id,
  content: note.content,
  createdAt: note.created_at,
  updatedAt: note.updated_at,
});

const applyNotesFilter = <T extends {
  gte: (column: string, value: string) => T;
  lte: (column: string, value: string) => T;
  textSearch: (
    column: string,
    query: string,
    options: {
      config: string;
      type: 'websearch';
    },
  ) => T;
}>(query: T, filter: NormalizedNotesFilter): T => {
  let filteredQuery = query;

  if (filter.dateMs !== undefined) {
    const selectedDate = new Date(filter.dateMs);

    filteredQuery = filteredQuery
      .gte('created_at', startOfDay(selectedDate).toISOString())
      .lte('created_at', endOfDay(selectedDate).toISOString());
  }

  if (filter.query) {
    filteredQuery = filteredQuery.textSearch('search', filter.query, {
      config: 'english',
      type: 'websearch',
    });
  }

  return filteredQuery;
};

export const useNotes = () => {
  //========== Store States==========//
  const session = useAuthStore((state) => state.session);
  const notes = useNotesStore((state) => state.notes);
  const isLoading = useNotesStore((state) => state.isLoading);
  const error = useNotesStore((state) => state.error);
  const currentPage = useNotesStore((state) => state.currentPage);
  const hasMore = useNotesStore((state) => state.hasMore);

  //========== Store Functions==========//
  const setNotes = useNotesStore((state) => state.setNotes);
  const setIsLoading = useNotesStore((state) => state.setIsLoading);
  const setError = useNotesStore((state) => state.setError);
  const setCurrentPage = useNotesStore((state) => state.setCurrentPage);
  const setHasMore = useNotesStore((state) => state.setHasMore);

  //========== Callbacks ==========//
  const loadNotes = useCallback(async (filter?: NotesFilter & PaginationOptions) => {
    const normalizedFilter = normalizeFilter(filter);
    const page = filter?.page ?? 0;
    const append = filter?.append ?? page > 0;
    const rangeStart = page * normalizedFilter.limit;
    const rangeEnd = rangeStart + normalizedFilter.limit - 1;
    const existingNotes = useNotesStore.getState().notes;

    setIsLoading(true);
    setError(null);

    if (!append) {
      setNotes([]);
    }

    const dataQuery = applyNotesFilter(
      supabase
        .from('notes')
        .select('id, user_id, content, created_at, updated_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(rangeStart, rangeEnd),
      normalizedFilter,
    );

    const { data, count, error: selectError } = await dataQuery;

    if (selectError) {
      setNotes(append ? existingNotes : []);
      setError(selectError.message ?? 'Failed to load notes');
      setIsLoading(false);
      return;
    }

    const mappedNotes = (data ?? []).map(mapNote);
    const nextNotes = append ? [...existingNotes, ...mappedNotes] : mappedNotes;
    const totalLoadedNotes = rangeStart + mappedNotes.length;

    setNotes(nextNotes);
    setError(null);
    setIsLoading(false);
    setCurrentPage(page);
    setHasMore(count !== null && totalLoadedNotes < count);
  }, [setCurrentPage, setError, setHasMore, setIsLoading, setNotes]);

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
    setNotes,
    setIsLoading,
    setError,
    setCurrentPage,
    setHasMore,
    createNote,
    updateNote,
    deleteNote,
    loadNotes,
  };
};
