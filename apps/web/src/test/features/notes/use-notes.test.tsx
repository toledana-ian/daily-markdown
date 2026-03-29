import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const queryCalls: Array<{
  range: [number, number] | null;
  textSearch: string | null;
  gte: string | null;
  lte: string | null;
  selectOptions: Record<string, unknown> | null;
}> = [];

const queryResults = new Map<string, {
  data: Array<Record<string, string>>;
  error: null;
  count: number | null;
}>();

class MockNotesQuery {
  private readonly call = {
    range: null as [number, number] | null,
    textSearch: null as string | null,
    gte: null as string | null,
    lte: null as string | null,
    selectOptions: null as Record<string, unknown> | null,
  };

  select(_columns?: string, options?: Record<string, unknown>) {
    this.call.selectOptions = options ?? null;
    return this;
  }

  order() {
    return this;
  }

  range(from: number, to: number) {
    this.call.range = [from, to];
    return this;
  }

  gte(_column: string, value: string) {
    this.call.gte = value;
    return this;
  }

  lte(_column: string, value: string) {
    this.call.lte = value;
    return this;
  }

  textSearch(_column: string, value: string) {
    this.call.textSearch = value;
    return this;
  }

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?: ((value: {
      data: Array<Record<string, string>>;
      error: null;
      count: number | null;
    }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    queryCalls.push({ ...this.call });
    const key = this.call.range ? `${this.call.range[0]}:${this.call.range[1]}` : 'default';
    const result = queryResults.get(key) ?? { data: [], error: null, count: null };

    return Promise.resolve(result).then(onfulfilled, onrejected);
  }
}

vi.mock('@/lib/supabase/client.ts', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: (columns?: string, options?: Record<string, unknown>) =>
        new MockNotesQuery().select(columns, options),
      insert: vi.fn(),
      update: vi.fn(() => ({ eq: vi.fn() })),
      delete: vi.fn(() => ({ eq: vi.fn() })),
    })),
  },
}));

import { useNotes } from '@/features/notes/hooks/use-notes.ts';
import { useNotesStore } from '@/features/notes/store/notes.ts';

const createRow = (id: number) => ({
  id: `note-${id}`,
  user_id: 'user-1',
  content: `Note ${id}`,
  created_at: `2026-03-${`${(id % 28) + 1}`.padStart(2, '0')}T00:00:00.000Z`,
  updated_at: `2026-03-${`${(id % 28) + 1}`.padStart(2, '0')}T00:00:00.000Z`,
});

describe('useNotes', () => {
  beforeEach(() => {
    queryCalls.length = 0;
    queryResults.clear();
    useNotesStore.setState({
      notes: [],
      isLoading: true,
      error: null,
      currentPage: 0,
      hasMore: false,
    });
  });

  it('loads the first page and appends the next page', async () => {
    queryResults.set('0:19', {
      data: Array.from({ length: 20 }, (_, index) => createRow(index + 1)),
      error: null,
      count: 21,
    });
    queryResults.set('20:39', {
      data: [createRow(21)],
      error: null,
      count: 21,
    });

    const { result } = renderHook(() => useNotes());

    await act(async () => {
      await result.current.loadNotes({ limit: 20 });
    });

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(20);
    });

    expect(queryCalls[0]?.range).toEqual([0, 19]);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadNotes({ page: 1, append: true, limit: 20 });
    });

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(21);
    });

    expect(queryCalls[1]?.range).toEqual([20, 39]);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasMore).toBe(false);
  });

  it('sets hasMore to false when the fetched page reaches the total count', async () => {
    queryResults.set('0:19', {
      data: Array.from({ length: 20 }, (_, index) => createRow(index + 1)),
      error: null,
      count: 20,
    });

    const { result } = renderHook(() => useNotes());

    await act(async () => {
      await result.current.loadNotes({ limit: 20 });
    });

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(20);
    });

    expect(queryCalls[0]?.selectOptions).toEqual({ count: 'exact' });
    expect(result.current.hasMore).toBe(false);
  });
});
