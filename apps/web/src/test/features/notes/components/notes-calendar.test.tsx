import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NotesCalendar } from '@/features/notes/components/notes-calendar';

describe('NotesCalendar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-03-24T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('selects today by default when uncontrolled', () => {
    const { container } = render(<NotesCalendar />);

    const todayButton = container.querySelector('[data-day="3/24/2025"]');

    expect(todayButton).toHaveAttribute('data-selected-single', 'true');
  });

  it('allows clearing the active date by clicking it again', () => {
    const onSelect = vi.fn();
    const { container } = render(<NotesCalendar onSelect={onSelect} />);

    const todayButton = container.querySelector('[data-day="3/24/2025"]');

    expect(todayButton).not.toBeNull();

    fireEvent.click(todayButton as HTMLButtonElement);

    expect(onSelect).toHaveBeenCalledWith(undefined);
    expect(container.querySelector('[data-day="3/24/2025"]')).not.toHaveAttribute(
      'data-selected-single',
    );
  });

  it('applies the configured intensity level for note counts', () => {
    const { container } = render(
      <NotesCalendar
        noteCountsByDate={[
          { date: new Date('2025-03-18T00:00:00Z'), count: 4 },
          { date: new Date('2025-03-19T00:00:00Z'), count: 11 },
          { date: new Date('2025-03-20T00:00:00Z'), count: 27 },
        ]}
      />,
    );

    expect(container.querySelector('[data-day="3/18/2025"]')).toHaveAttribute(
      'data-intensity-level',
      '1',
    );
    expect(container.querySelector('[data-day="3/19/2025"]')).toHaveAttribute(
      'data-intensity-level',
      '3',
    );
    expect(container.querySelector('[data-day="3/20/2025"]')).toHaveAttribute(
      'data-intensity-level',
      '5',
    );
  });

  it('notifies consumers when the displayed month changes', () => {
    const onMonthChange = vi.fn();

    render(<NotesCalendar onMonthChange={onMonthChange} />);

    fireEvent.click(screen.getByRole('button', { name: /go to the next month/i }));

    expect(onMonthChange).toHaveBeenCalledTimes(1);
    expect(onMonthChange.mock.calls[0]?.[0]).toBeInstanceOf(Date);
  });
});
