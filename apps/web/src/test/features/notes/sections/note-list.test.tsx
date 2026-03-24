import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { NoteListSection } from '@/features/notes/sections/note-list';
import { useNoteSearchStore } from '@/features/notes/store/note-search';

describe('NoteListSection', () => {
  beforeEach(() => {
    useNoteSearchStore.setState({ query: '' });
  });

  it('filters visible notes using the shared search query', () => {
    useNoteSearchStore.setState({ query: 'react' });

    render(<NoteListSection />);

    expect(
      screen.getByText(/working on #react #typescript #tailwind #markdown/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/hello world/i)).not.toBeInTheDocument();
  });
});
