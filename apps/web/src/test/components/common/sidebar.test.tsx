import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Sidebar } from '@/components/common/sidebar';
import { useNoteSearchStore } from '@/features/notes/store/note-search';

describe('Sidebar', () => {
  beforeEach(() => {
    useNoteSearchStore.setState({ query: '' });
  });

  it('renders a notes search field above the calendar and updates shared search state', () => {
    render(<Sidebar isVisible={true} />);

    const searchInput = screen.getAllByRole('searchbox', { name: /search notes/i })[0];
    const calendar = screen.getAllByLabelText(/sidebar calendar/i)[0];

    expect(searchInput).toBeInTheDocument();
    expect(
      searchInput.compareDocumentPosition(calendar) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    fireEvent.change(searchInput, { target: { value: 'react' } });

    expect(useNoteSearchStore.getState().query).toBe('react');
  });
});
