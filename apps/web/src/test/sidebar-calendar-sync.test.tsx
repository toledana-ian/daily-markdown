import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Sidebar } from '@/components/common/sidebar.tsx';
import { useCalendarStore } from '@/features/calendar/store/calendar.ts';

vi.mock('@/features/calendar/hooks/useNoteCountsByDate.ts', () => ({
  useNoteCountsByDate: vi.fn(() => ({
    noteCountsByDate: [],
    isLoading: false,
    loadNoteCountsByDate: vi.fn(),
  })),
}));

vi.mock('@/features/calendar/components/notes-calendar.tsx', () => ({
  NotesCalendar: ({
    onMonthChange,
  }: {
    onMonthChange?: (month: Date) => void;
  }) => (
    <button
      type='button'
      onClick={() => onMonthChange?.(new Date('2027-01-01T00:00:00.000Z'))}
    >
      Change month
    </button>
  ),
}));

describe('Sidebar calendar sync', () => {
  beforeEach(() => {
    useCalendarStore.setState({
      selectedDate: new Date('2026-03-30T00:00:00.000Z'),
      displayedMonth: 2,
      displayedYear: 2026,
    });
  });

  it('updates the calendar store when the viewed month changes', () => {
    render(
      <Sidebar
        isVisible
        selectedDate={new Date('2026-03-30T00:00:00.000Z')}
        displayedMonth={2}
        displayedYear={2026}
        setSelectedDate={vi.fn()}
        setDisplayedDate={(date) => useCalendarStore.getState().setDisplayedDate(date)}
        query=''
        setQuery={vi.fn()}
      />,
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Change month' })[0]!);

    expect(useCalendarStore.getState().displayedMonth).toBe(0);
    expect(useCalendarStore.getState().displayedYear).toBe(2027);
  });
});
