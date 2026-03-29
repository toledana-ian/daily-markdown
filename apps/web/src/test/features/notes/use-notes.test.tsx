import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const queryCalls: Array<{
  range: [number, number] | null;
  textSearch: string | null;
  gte: string | null;
  lte: string | null;
}> = [];

const queryResults = new Map<string, { data: Array<Record<string, string>>; error: null }>();

class MockNotesQuery {
  private readonly call = {
    range: null as [number, number] | null,
    textSearch: null as string | null,
    gte: null as string | null,
    lte: null as string | null,
  };

  select() {
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
    onfulfilled?: ((value: { data: Array<Record<string, string>>; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    queryCalls.push({ ...this.call });
    const key = this.call.range ? `${this.call.range[0]}:${this.call.range[1]}` : 'default';
    const result = queryResults.get(key) ?? { data: [], error: null };

    return Promise.resolve(result).then(onfulfilled, onrejected);
  }
}

vi.mock('@/lib/supabase/client.ts', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: () => new MockNotesQuery(),
      insert: vi.fn(),
      update: vi.fn(() => ({ eq: vi.fn() })),
      delete: vi.fn(() => ({ eq: vi.fn() })),
    })),
  },
}));

import { useNotes, useNotesStore } from '@/features/notes/hooks/use-notes.ts';

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

  it('loads the first page on mount and appends the next page', async () => {
    queryResults.set('0:19', {
      data: Array.from({ length: 20 }, (_, index) => createRow(index + 1)),
      error: null,
    });
    queryResults.set('20:39', {
      data: [createRow(21)],
      error: null,
    });

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(20);
    });

    expect(queryCalls[0]?.range).toEqual([0, 19]);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMoreNotes();
    });

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(21);
    });

    expect(queryCalls[1]?.range).toEqual([20, 39]);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasMore).toBe(false);
  });
});
