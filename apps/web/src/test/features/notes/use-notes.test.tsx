import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { endOfDay, startOfDay } from 'date-fns';

const queryCalls: Array<{
  range: [number, number] | null;
  textSearch: string | null;
  gte: string | null;
  lte: string | null;
  selectOptions: Record<string, unknown> | null;
  selectColumns: string | null;
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
    selectColumns: null as string | null,
  };

  select(columns?: string, options?: Record<string, unknown>) {
    this.call.selectColumns = columns ?? null;
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
    const key = [
      this.call.selectColumns ?? '*',
      this.call.range ? `${this.call.range[0]}:${this.call.range[1]}` : 'no-range',
      this.call.textSearch ?? 'no-search',
      this.call.gte ?? 'no-gte',
      this.call.lte ?? 'no-lte',
    ].join('|');
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
  const buildQueryKey = ({
    selectColumns,
    range,
    textSearch,
    gte,
    lte,
  }: {
    selectColumns: string;
    range?: [number, number];
    textSearch?: string;
    gte?: string;
    lte?: string;
  }) =>
    [
      selectColumns,
      range ? `${range[0]}:${range[1]}` : 'no-range',
      textSearch ?? 'no-search',
      gte ?? 'no-gte',
      lte ?? 'no-lte',
    ].join('|');

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
    queryResults.set(buildQueryKey({
      selectColumns: 'id, user_id, content, created_at, updated_at',
      range: [0, 19],
    }), {
      data: Array.from({ length: 20 }, (_, index) => createRow(index + 1)),
      error: null,
      count: null,
    });
    queryResults.set(buildQueryKey({
      selectColumns: 'count',
    }), {
      data: [],
      error: null,
      count: 21,
    });
    queryResults.set(buildQueryKey({
      selectColumns: 'id, user_id, content, created_at, updated_at',
      range: [20, 39],
    }), {
      data: [createRow(21)],
      error: null,
      count: null,
    });

    const { result } = renderHook(() => useNotes());

    await act(async () => {
      await result.current.loadNotes({ limit: 20 });
    });

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(20);
    });

    expect(queryCalls[0]?.range).toEqual([0, 19]);
    expect(queryCalls[0]?.selectColumns).toBe('id, user_id, content, created_at, updated_at');
    expect(queryCalls[1]?.selectColumns).toBe('count');
    expect(queryCalls[1]?.range).toBeNull();
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadNotes({ page: 1, append: true, limit: 20 });
    });

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(21);
    });

    expect(queryCalls[2]?.range).toEqual([20, 39]);
    expect(queryCalls[3]?.selectColumns).toBe('count');
    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasMore).toBe(false);
  });

  it('uses the same filters for the count query and the data query', async () => {
    const selectedDate = new Date('2026-03-10T12:00:00.000Z');
    const gte = startOfDay(selectedDate).toISOString();
    const lte = endOfDay(selectedDate).toISOString();
    queryResults.set(buildQueryKey({
      selectColumns: 'id, user_id, content, created_at, updated_at',
      range: [0, 19],
      textSearch: 'alpha beta',
      gte,
      lte,
    }), {
      data: Array.from({ length: 20 }, (_, index) => createRow(index + 1)),
      error: null,
      count: null,
    });
    queryResults.set(buildQueryKey({
      selectColumns: 'count',
      textSearch: 'alpha beta',
      gte,
      lte,
    }), {
      data: [],
      error: null,
      count: 20,
    });

    const { result } = renderHook(() => useNotes());

    await act(async () => {
      await result.current.loadNotes({
        limit: 20,
        query: 'alpha beta',
        date: selectedDate,
      });
    });

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(20);
    });

    expect(queryCalls).toHaveLength(2);
    expect(queryCalls[0]?.selectOptions).toBeNull();
    expect(queryCalls[1]?.selectOptions).toEqual({ count: 'exact', head: true });
    expect(queryCalls[0]?.textSearch).toBe('alpha beta');
    expect(queryCalls[1]?.textSearch).toBe('alpha beta');
    expect(queryCalls[0]?.gte).toBe(gte);
    expect(queryCalls[1]?.gte).toBe(gte);
    expect(queryCalls[0]?.lte).toBe(lte);
    expect(queryCalls[1]?.lte).toBe(lte);
    expect(result.current.hasMore).toBe(false);
  });
});
