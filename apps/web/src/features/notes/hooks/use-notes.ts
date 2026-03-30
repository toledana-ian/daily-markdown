import { supabase } from '@/lib/supabase/client.ts';
import { useAuthStore } from '@/features/auth/store/auth.ts';
import { extractTagsFromContent } from '@/features/tags/utils/tags.ts';
import { useNotesStore } from '@/features/notes/store/notes.ts';
import { endOfDay, startOfDay } from 'date-fns';
import { useCallback, useEffect, useRef } from 'react';

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

  //========== Refs ==========//
  const notesRef = useRef(notes)
  const userIdRef = useRef<string | null>(null);

  //========== Store Functions==========//
  const setNotes = useNotesStore((state) => state.setNotes);
  const setIsLoading = useNotesStore((state) => state.setIsLoading);
  const setError = useNotesStore((state) => state.setError);
  const setCurrentPage = useNotesStore((state) => state.setCurrentPage);
  const setHasMore = useNotesStore((state) => state.setHasMore);

  //========== Effects ==========//
  useEffect(() => {notesRef.current = notes;}, [notes])
  useEffect(()=>{userIdRef.current = session?.user?.id ?? null;}, [session?.user?.id])

  //========== Callbacks ==========//
  const updateTags = useCallback(async (userId:string, noteId: string, content: string) => {
    await supabase.from('note_tags').delete().eq('note_id', noteId);

    const extractedTags = extractTagsFromContent(content);
    if (extractedTags.length===0) return;

    const { data: tagRows, error: tagsError } = await supabase
      .from('tags')
      .upsert(
        extractedTags.map((name) => ({
          name,
        })),
        {
          onConflict: 'user_id,name',
        },
      )
      .select('id, name');

    if (tagsError) {
      setError(tagsError.message);
      throw tagsError;
    }

    const insertedTags = tagRows ?? [];
    if (insertedTags.length===0) return;

    const { error: noteTagsError } = await supabase.from('note_tags').insert(
      insertedTags.map((tag) => ({
        note_id: noteId,
        tag_id: tag.id,
        user_id: userId,
      })),
    );

    if (noteTagsError) {
      setError(noteTagsError.message);
      throw noteTagsError;
    }
  }, [setError]);

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
      .select('id, user_id, content, created_at, updated_at')
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

    await updateTags(userId, data.id, content);

    return data.id;
  }, [setError, setNotes]);

  const updateNote = async (id: string, content: string) => {
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
    setNotes(newNotes)

    await supabase
      .from('notes')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    await updateTags(userId, id, content);
  };

  const deleteNote = useCallback(async (id: string) => {
    const newNotes = notesRef.current.filter((note) => note.id !== id);
    setNotes(newNotes);
    await supabase.from('notes').delete().eq('id', id);
  }, [setNotes]);

  return {
    notes,
    isLoading,
    error,
    hasMore,
    currentPage,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
  };
};
