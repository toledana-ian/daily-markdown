import type { Note, NotesFilter } from '@/features/notes/hooks/use-notes.ts';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client.ts';
import { endOfDay, startOfDay } from 'date-fns';

//========== Constants ==========//
const DEFAULT_LIMIT = 4;

//========== Interface ==========//
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

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  loadNotes: (filter?: NotesFilter & PaginationOptions) => Promise<void>;
}


//========== Helper Function ==========//
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

//========== Store ==========//
export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  isLoading: true,
  error: null,
  currentPage: 0,
  hasMore: false,
  loadNotes: async (filter) => {
    const normalizedFilter = normalizeFilter(filter);
    const page = filter?.page ?? 0;
    const append = filter?.append ?? page > 0;
    const rangeStart = page * normalizedFilter.limit;
    const rangeEnd = rangeStart + normalizedFilter.limit - 1;

    set((state) => ({
      isLoading: true,
      error: null,
      ...(append ? {} : { notes: [] }),
      currentPage: state.currentPage,
      hasMore: state.hasMore,
    }));

    const dataQuery = applyNotesFilter(
      supabase
      .from('notes')
      .select('id, user_id, content, created_at, updated_at')
      .order('created_at', { ascending: false })
      .range(rangeStart, rangeEnd),
      normalizedFilter,
    );

    const countQuery = applyNotesFilter(
      supabase.from('notes').select('*', { count: 'exact', head: true }),
      normalizedFilter,
    );

    const [{ data, error: selectError }, { count, error: countError }] = await Promise.all([
      dataQuery,
      countQuery,
    ]);

    console.log('count', count);

    if (selectError || countError) {
      set({
        notes: append ? useNotesStore.getState().notes : [],
        error: selectError?.message ?? countError?.message ?? 'Failed to load notes',
        isLoading: false,
      });
      return;
    }

    const mappedNotes = (data ?? []).map(mapNote);
    const totalLoadedNotes = rangeStart + mappedNotes.length;
    console.log('totalLoadedNotes', totalLoadedNotes);

    set((state) => ({
      notes: append ? [...state.notes, ...mappedNotes] : mappedNotes,
      error: null,
      isLoading: false,
      currentPage: page,
      hasMore: count !== null && totalLoadedNotes < count,
    }));
  },
}));
