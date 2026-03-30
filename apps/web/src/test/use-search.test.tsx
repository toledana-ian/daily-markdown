import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSearch } from '@/features/search/hooks/useSearch.ts';
import { useSearchStore } from '@/features/search/store/search.ts';

describe('useSearch', () => {
  beforeEach(() => {
    useSearchStore.setState({
      query: '',
    });
  });

  it('exposes the query and setter from the search store', () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.query).toBe('');

    act(() => {
      result.current.setQuery('meeting notes');
    });

    expect(result.current.query).toBe('meeting notes');
    expect(useSearchStore.getState().query).toBe('meeting notes');
  });
});
