import { supabase } from '@/lib/supabase/client.ts';
import { useAuthStore } from '@/features/auth/store/auth.ts';
import { useNotesStore } from '@/features/notes/store/notes.ts';
import { mergeRefreshedNotes, NOTES_REFRESH_INTERVAL_MS } from '@/features/notes/lib/notes-refresh.ts';
import { endOfDay, isToday, startOfDay } from 'date-fns';
import { useCallback, useEffect, useRef } from 'react';

//========== Constants ==========//
const DEFAULT_LIMIT = 10;

//========== Types ==========//
export interface Note {
  id: string;
  userId: string;
  content: string;
  isPinned: boolean;
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
  is_pinned: boolean;
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
  isPinned: note.is_pinned,
  createdAt: note.created_at,
  updatedAt: note.updated_at,
});

const applyNotesFilter = <T extends {
  or: (filters: string) => T;
}>(query: T, filter: NormalizedNotesFilter): T => {
  const hasDate = filter.dateMs !== undefined;
  const hasQuery = !!filter.query;

  if (!hasDate && !hasQuery) return query;

  const filterParts: string[] = [];

  if (hasDate) {
    const selectedDate = new Date(filter.dateMs!);
    const start = startOfDay(selectedDate).toISOString();
    const end = endOfDay(selectedDate).toISOString();
    filterParts.push(`and(created_at.gte.${start},created_at.lte.${end})`);
  }

  if (hasQuery) {
    filterParts.push(`search.wfts(english).${filter.query}`);
  }

  const combined = filterParts.length > 1
    ? `and(${filterParts.join(',')})`
    : filterParts[0]!;

  if (hasQuery) {
    return query.or(combined);
  }

  const isSelectedDateToday = hasDate && isToday(new Date(filter.dateMs!));

  if (isSelectedDateToday) {
    return query.or(`is_pinned.eq.true,${combined}`);
  }

  return query.or(combined);
};

export const useNotes = () => {
  //========== Store States==========//
  const session = useAuthStore((state) => state.session);
  const notes = useNotesStore((state) => state.notes);
  const isLoading = useNotesStore((state) => state.isLoading);
  const error = useNotesStore((state) => state.error);
  const currentPage = useNotesStore((state) => state.currentPage);
  const hasMore = useNotesStore((state) => state.hasMore);

  //========== Refs ==========//
  const notesRef = useRef(notes);
  const userIdRef = useRef<string | null>(null);
  const isRefreshingRef = useRef(false);

  //========== Store Functions==========//
  const setNotes = useNotesStore((state) => state.setNotes);
  const setIsLoading = useNotesStore((state) => state.setIsLoading);
  const setError = useNotesStore((state) => state.setError);
  const setCurrentPage = useNotesStore((state) => state.setCurrentPage);
  const setHasMore = useNotesStore((state) => state.setHasMore);
  const clearProtectedNotes = useNotesStore((state) => state.clearProtectedNotes);
  const protectNote = useNotesStore((state) => state.protectNote);
  const unprotectNote = useNotesStore((state) => state.unprotectNote);

  //========== Effects ==========//
  useEffect(() => { notesRef.current = notes; }, [notes]);
  useEffect(() => { userIdRef.current = session?.user?.id ?? null; }, [session?.user?.id]);

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
      clearProtectedNotes();
    }

    const dataQuery = applyNotesFilter(
      supabase
        .from('notes')
        .select('id, user_id, content, is_pinned, created_at, updated_at', { count: 'exact' })
        .order('is_pinned', { ascending: true })
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
  }, [clearProtectedNotes, setCurrentPage, setError, setHasMore, setIsLoading, setNotes]);

  const refreshNotes = useCallback(async (filter?: NotesFilter) => {
    if (isRefreshingRef.current || useNotesStore.getState().isLoading) {
      return;
    }

    const normalizedFilter = normalizeFilter(filter);
    const { currentPage, protectedNoteIds } = useNotesStore.getState();
    const rangeEnd = (currentPage + 1) * normalizedFilter.limit - 1;

    isRefreshingRef.current = true;

    try {
      const dataQuery = applyNotesFilter(
        supabase
          .from('notes')
          .select('id, user_id, content, is_pinned, created_at, updated_at', { count: 'exact' })
          .order('is_pinned', { ascending: true })
          .order('created_at', { ascending: false })
          .range(0, rangeEnd),
        normalizedFilter,
      );

      const { data, count, error: selectError } = await dataQuery;

      if (selectError) {
        return;
      }

      const fetchedNotes = (data ?? []).map(mapNote);
      const protectedIds = new Set(Object.keys(protectedNoteIds));
      const mergedNotes = mergeRefreshedNotes(useNotesStore.getState().notes, fetchedNotes, protectedIds);

      setNotes(mergedNotes);
      setHasMore(count !== null && mergedNotes.length < count);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [setHasMore, setNotes]);

  const createNote = useCallback(async (content: string): Promise<string | null> => {
    const userId = userIdRef.current;

    if (!userId) {
      const authError = new Error('You must be signed in to create notes.');
      setError(authError.message);
      throw authError;
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        content,
        user_id: userId,
      })
      .select('id, user_id, content, is_pinned, created_at, updated_at')
      .single();

    if (error) {
      setError(error.message);
      throw error;
    }

    if (!data) {
      const insertError = new Error('Failed to create note');
      setError(insertError.message);
      throw insertError;
    }

    setNotes([mapNote(data), ...notesRef.current]);

    return data.id;
  }, [setError, setNotes]);

  const updateNote = useCallback(async (id: string, content: string) => {
    const userId = userIdRef.current;

    if (!userId) {
      const authError = new Error('You must be signed in to create notes.');
      setError(authError.message);
      throw authError;
    }

    const index = notesRef.current.findIndex((note) => note.id === id);

    if (index === -1) return;

    const newNotes = [...notesRef.current];
    newNotes[index] = { ...newNotes[index], content };
    setNotes(newNotes);

    await supabase
      .from('notes')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  }, [setError, setNotes]);

  const deleteNote = useCallback(async (id: string) => {
    const newNotes = notesRef.current.filter((note) => note.id !== id);
    setNotes(newNotes);
    await supabase.from('notes').delete().eq('id', id);
  }, [setNotes]);

  const togglePinNote = useCallback(async (id: string) => {
    const index = notesRef.current.findIndex((note) => note.id === id);
    if (index === -1) return;

    const isPinned = !notesRef.current[index]!.isPinned;
    const newNotes = [...notesRef.current];
    newNotes[index] = { ...newNotes[index]!, isPinned };
    setNotes(newNotes);

    await supabase.from('notes').update({ is_pinned: isPinned }).eq('id', id);
  }, [setNotes]);

  return {
    notes,
    isLoading,
    error,
    hasMore,
    currentPage,
    loadNotes,
    refreshNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePinNote,
    protectNote,
    unprotectNote,
  };
};

export const useNotesAutoRefresh = (filter?: NotesFilter) => {
  const { refreshNotes } = useNotes();
  const filterRef = useRef(filter);
  const filterDateMs = filter?.date?.getTime();
  const filterQuery = filter?.query;
  const filterLimit = filter?.limit;

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  useEffect(() => {
    const runRefresh = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      refreshNotes(filterRef.current).then();
    };

    const intervalId = window.setInterval(runRefresh, NOTES_REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        runRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshNotes, filterDateMs, filterQuery, filterLimit]);
};
