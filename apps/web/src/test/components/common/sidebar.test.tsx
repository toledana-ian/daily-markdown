import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { format } from 'date-fns';
import { Sidebar } from '@/components/common/sidebar';
import { useNoteSearchStore } from '@/features/notes/store/note-search';
import { useNoteDateStore } from '@/features/notes/store/note-date';

describe('Sidebar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-03-24T12:00:00Z'));
    useNoteSearchStore.setState({ query: '' });
    useNoteDateStore.setState({ selectedDate: new Date('2025-03-24T12:00:00Z') });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a notes search field above the calendar and updates shared search state', () => {
    const { container } = render(<Sidebar isVisible={true} />);

    const searchInput = screen.getAllByRole('searchbox', { name: /search notes/i })[0];
    const calendar = container.querySelector('[data-slot="calendar"]');

    expect(searchInput).toBeInTheDocument();
    expect(calendar).not.toBeNull();
    expect(
      searchInput.compareDocumentPosition(calendar as Element) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    fireEvent.change(searchInput, { target: { value: 'react' } });

    expect(useNoteSearchStore.getState().query).toBe('react');
  });

  it('updates the shared selected date when a calendar day is chosen', () => {
    const { container } = render(<Sidebar isVisible={true} />);

    const dateButton = container.querySelector('[data-day="3/18/2025"]');

    expect(dateButton).not.toBeNull();

    fireEvent.click(dateButton as HTMLButtonElement);

    expect(format(useNoteDateStore.getState().selectedDate, 'yyyy-MM-dd')).toBe('2025-03-18');
  });
});
