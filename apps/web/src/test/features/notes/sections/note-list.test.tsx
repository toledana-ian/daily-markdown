import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NoteListSection } from '@/features/notes/sections/note-list';
import { useNoteSearchStore } from '@/features/notes/store/note-search';
import { useNoteDateStore } from '@/features/notes/store/note-date';

describe('NoteListSection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-03-24T12:00:00Z'));
    useNoteSearchStore.setState({ query: '' });
    useNoteDateStore.setState({ selectedDate: new Date('2025-03-24T12:00:00Z') });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('filters visible notes using the shared search query', () => {
    useNoteSearchStore.setState({ query: 'react' });

    render(<NoteListSection />);

    expect(
      screen.getByText(/working on #react #typescript #tailwind #markdown/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/hello world/i)).not.toBeInTheDocument();
  });

  it('renders the default title for today', () => {
    render(<NoteListSection />);

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Monday, March 24')).toBeInTheDocument();
  });

  it('renders a search title when only a search query is active', () => {
    useNoteSearchStore.setState({ query: 'react' });

    render(<NoteListSection />);

    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('“react”')).toBeInTheDocument();
  });

  it('renders date-specific title text for a non-today date in the same year', () => {
    useNoteDateStore.setState({ selectedDate: new Date('2025-03-18T12:00:00Z') });

    render(<NoteListSection />);

    expect(screen.getByText('March 18')).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
  });

  it('renders search and different-year date title text together', () => {
    useNoteSearchStore.setState({ query: 'react' });
    useNoteDateStore.setState({ selectedDate: new Date('2024-03-18T12:00:00Z') });

    render(<NoteListSection />);

    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('March 18, 2024: “react”')).toBeInTheDocument();
  });
});
