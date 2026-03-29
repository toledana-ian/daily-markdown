import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNoteDateStore } from '@/features/notes/store/note-date.ts';
import { useNoteSearchStore } from '@/features/notes/store/note-search.ts';

const loadNotes = vi.fn(() => Promise.resolve());

vi.mock('@/features/notes/hooks/use-notes.ts', () => ({
  useNotes: () => ({
    notes: [{ id: 'note-1', content: 'First note' }],
    currentPage: 0,
    isLoading: false,
    error: null,
    hasMore: true,
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    loadNotes,
  }),
}));

vi.mock('@/features/notes/components/note-card.tsx', () => ({
  NoteCard: ({ content }: { content: string }) => <div>{content}</div>,
}));

import { NoteListSection } from '@/features/notes/sections/note-list.tsx';

class TestIntersectionObserver implements IntersectionObserver {
  static callback: IntersectionObserverCallback | null = null;

  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];

  constructor(callback: IntersectionObserverCallback) {
    TestIntersectionObserver.callback = callback;
  }

  disconnect() {}

  observe() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  unobserve() {}
}

describe('NoteListSection', () => {
  beforeEach(() => {
    loadNotes.mockClear();
    useNoteSearchStore.setState({ query: 'search term' });
    useNoteDateStore.setState({ selectedDate: new Date('2026-03-10T00:00:00.000Z') });
    TestIntersectionObserver.callback = null;
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: TestIntersectionObserver,
    });
  });

  it('loads the next page when the load more sentinel becomes visible', async () => {
    render(<NoteListSection />);

    await waitFor(() => {
      expect(loadNotes).toHaveBeenCalledWith({
        date: new Date('2026-03-10T00:00:00.000Z'),
        query: 'search term',
      });
    });

    expect(screen.getByText('Load more')).toBeInTheDocument();
    expect(loadNotes).toHaveBeenCalledTimes(1);
    expect(TestIntersectionObserver.callback).not.toBeNull();

    await act(async () => {
      TestIntersectionObserver.callback?.(
        [
          {
            isIntersecting: true,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    });

    await waitFor(() => {
      expect(loadNotes).toHaveBeenCalledWith({
        date: new Date('2026-03-10T00:00:00.000Z'),
        query: 'search term',
        append: true,
        page: 1,
      });
    });
  });
});
