import { act, renderHook, waitFor } from '@testing-library/react';
import { endOfDay, startOfDay } from 'date-fns';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth';
import { useNotes } from '@/features/notes/hooks/use-notes';

type NoteRow = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

class MockPromiseBuilder<T> implements PromiseLike<T> {
  response: T;

  constructor(response: T) {
    this.response = response;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.response).then(onfulfilled, onrejected);
  }
}

class MockSelectBuilder extends MockPromiseBuilder<{
  data: NoteRow[] | null;
  error: Error | null;
}> {
  gte = vi.fn<(column: string, value: string) => this>(() => this);
  lte = vi.fn<(column: string, value: string) => this>(() => this);
  order = vi.fn<(column: string, options: { ascending: boolean }) => this>(() => this);
  limit = vi.fn<(value: number) => this>(() => this);
  textSearch = vi.fn<
    (column: string, query: string, options: { config: string; type: 'websearch' }) => this
  >(() => this);
}

class MockMutationBuilder extends MockPromiseBuilder<{ data: null; error: Error | null }> {
  eq = vi.fn<(column: string, value: string) => this>(() => this);
}

type RealtimeCallback = () => void | Promise<void>;

const supabaseMockState = vi.hoisted(() => ({
  selectBuilders: [] as MockSelectBuilder[],
  insertBuilders: [] as MockMutationBuilder[],
  updateBuilders: [] as MockMutationBuilder[],
  deleteBuilders: [] as MockMutationBuilder[],
  realtimeCallbacks: [] as RealtimeCallback[],
  selectResponses: [] as Array<{ data: NoteRow[] | null; error: Error | null }>,
  mutationResponses: [] as Array<{ data: null; error: Error | null }>,
  insertPayloads: [] as unknown[],
  updatePayloads: [] as unknown[],
  removeChannel: vi.fn(),
  from: vi.fn((table: string) => {
    expect(table).toBe('notes');

    return {
      select: vi.fn(() => {
        const builder = new MockSelectBuilder(
          supabaseMockState.selectResponses.shift() ?? {
            data: [],
            error: null,
          },
        );
        supabaseMockState.selectBuilders.push(builder);
        return builder;
      }),
      insert: vi.fn((value: unknown) => {
        supabaseMockState.insertPayloads.push(value);
        const builder = new MockMutationBuilder(
          supabaseMockState.mutationResponses.shift() ?? {
            data: null,
            error: null,
          },
        );
        supabaseMockState.insertBuilders.push(builder);
        return builder;
      }),
      update: vi.fn((value: unknown) => {
        supabaseMockState.updatePayloads.push(value);
        const builder = new MockMutationBuilder(
          supabaseMockState.mutationResponses.shift() ?? {
            data: null,
            error: null,
          },
        );
        supabaseMockState.updateBuilders.push(builder);
        return builder;
      }),
      delete: vi.fn(() => {
        const builder = new MockMutationBuilder(
          supabaseMockState.mutationResponses.shift() ?? {
            data: null,
            error: null,
          },
        );
        supabaseMockState.deleteBuilders.push(builder);
        return builder;
      }),
    };
  }),
  channel: vi.fn(() => ({
    on: vi.fn(
      (
        _type: 'postgres_changes',
        _filter: { event: '*'; schema: 'public'; table: 'notes' },
        callback: RealtimeCallback,
      ) => {
        supabaseMockState.realtimeCallbacks.push(callback);
        return {
          subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
        };
      },
    ),
  })),
}));

vi.mock('@/lib/supabase/client.ts', () => ({
  supabase: {
    from: supabaseMockState.from,
    channel: supabaseMockState.channel,
    removeChannel: supabaseMockState.removeChannel,
  },
}));

describe('useNotes', () => {
  beforeEach(() => {
    supabaseMockState.selectResponses.length = 0;
    supabaseMockState.mutationResponses.length = 0;
    supabaseMockState.selectBuilders.length = 0;
    supabaseMockState.insertBuilders.length = 0;
    supabaseMockState.updateBuilders.length = 0;
    supabaseMockState.deleteBuilders.length = 0;
    supabaseMockState.insertPayloads.length = 0;
    supabaseMockState.updatePayloads.length = 0;
    supabaseMockState.realtimeCallbacks.length = 0;
    supabaseMockState.from.mockClear();
    supabaseMockState.channel.mockClear();
    supabaseMockState.removeChannel.mockClear();
    useAuthStore.setState({
      loading: false,
      session: {
        access_token: 'token',
        token_type: 'bearer',
        user: {
          id: 'user-1',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2025-03-24T00:00:00.000Z',
        },
      } as never,
    });
  });

  it('does not fetch when both date and query filters are missing', async () => {
    const { result } = renderHook(() => useNotes({}));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(supabaseMockState.from).not.toHaveBeenCalled();
    expect(result.current.notes).toEqual([]);
  });

  it('loads notes for the selected date instead of returning all notes', async () => {
    supabaseMockState.selectResponses.push({
      data: [
        {
          id: 'note-1',
          user_id: 'user-1',
          content: '# March 24',
          created_at: '2025-03-24T06:30:00.000Z',
          updated_at: '2025-03-24T06:30:00.000Z',
        },
      ],
      error: null,
    });

    const selectedDate = new Date('2025-03-24T12:00:00.000Z');
    const { result } = renderHook(() => useNotes({ date: selectedDate }));

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(1);
    });

    expect(supabaseMockState.selectBuilders).toHaveLength(1);
    expect(supabaseMockState.selectBuilders[0]?.gte).toHaveBeenCalledWith(
      'created_at',
      startOfDay(selectedDate).toISOString(),
    );
    expect(supabaseMockState.selectBuilders[0]?.lte).toHaveBeenCalledWith(
      'created_at',
      endOfDay(selectedDate).toISOString(),
    );
    expect(supabaseMockState.selectBuilders[0]?.limit).toHaveBeenCalledWith(50);
  });

  it('applies full text search when a query is provided', async () => {
    supabaseMockState.selectResponses.push({
      data: [
        {
          id: 'note-2',
          user_id: 'user-1',
          content: '# React hooks',
          created_at: '2025-03-24T06:30:00.000Z',
          updated_at: '2025-03-24T06:30:00.000Z',
        },
      ],
      error: null,
    });

    const { result } = renderHook(() => useNotes({ query: 'react hooks' }));

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(1);
    });

    expect(supabaseMockState.selectBuilders[0]?.textSearch).toHaveBeenCalledWith(
      'search',
      'react hooks',
      {
        config: 'english',
        type: 'websearch',
      },
    );
  });

  it('refreshes notes when the realtime subscription receives a change', async () => {
    supabaseMockState.selectResponses.push(
      {
        data: [],
        error: null,
      },
      {
        data: [
          {
            id: 'note-3',
            user_id: 'user-1',
            content: '# Synced',
            created_at: '2025-03-24T06:30:00.000Z',
            updated_at: '2025-03-24T06:30:00.000Z',
          },
        ],
        error: null,
      },
    );

    const { result } = renderHook(() => useNotes({ date: new Date('2025-03-24T12:00:00.000Z') }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await supabaseMockState.realtimeCallbacks[0]?.();
    });

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(1);
    });

    expect(supabaseMockState.from).toHaveBeenCalledTimes(2);
  });

  it('reloads notes when the exposed reload function is called', async () => {
    supabaseMockState.selectResponses.push(
      { data: [], error: null },
      {
        data: [
          {
            id: 'note-4',
            user_id: 'user-1',
            content: '# Reloaded',
            created_at: '2025-03-24T06:30:00.000Z',
            updated_at: '2025-03-24T06:30:00.000Z',
          },
        ],
        error: null,
      },
    );

    const { result } = renderHook(() => useNotes({ date: new Date('2025-03-24T12:00:00.000Z') }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.reload();
    });

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(1);
    });

    expect(supabaseMockState.from).toHaveBeenCalledTimes(2);
  });

  it('creates a note through the Supabase data api and reloads the filtered list', async () => {
    supabaseMockState.selectResponses.push({ data: [], error: null }, { data: [], error: null });
    supabaseMockState.mutationResponses.push({ data: null, error: null });

    const { result } = renderHook(() => useNotes({ date: new Date('2025-03-24T12:00:00.000Z') }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createNote('# Created');
    });

    expect(supabaseMockState.insertPayloads[0]).toEqual({
      content: '# Created',
      user_id: 'user-1',
    });
    expect(supabaseMockState.from).toHaveBeenCalledTimes(3);
  });

  it('updates a note through the Supabase data api', async () => {
    supabaseMockState.selectResponses.push({ data: [], error: null }, { data: [], error: null });
    supabaseMockState.mutationResponses.push({ data: null, error: null });

    const { result } = renderHook(() => useNotes({ date: new Date('2025-03-24T12:00:00.000Z') }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateNote('note-1', '## Updated');
    });

    expect(supabaseMockState.updatePayloads[0]).toEqual({
      content: '## Updated',
      updated_at: expect.any(String),
    });
    expect(supabaseMockState.updateBuilders[0]?.eq).toHaveBeenCalledWith('id', 'note-1');
  });

  it('deletes a note through the Supabase data api', async () => {
    supabaseMockState.selectResponses.push({ data: [], error: null }, { data: [], error: null });
    supabaseMockState.mutationResponses.push({ data: null, error: null });

    const { result } = renderHook(() => useNotes({ date: new Date('2025-03-24T12:00:00.000Z') }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteNote('note-1');
    });

    expect(supabaseMockState.deleteBuilders[0]?.eq).toHaveBeenCalledWith('id', 'note-1');
  });
});
