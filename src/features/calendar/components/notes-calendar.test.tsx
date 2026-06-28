import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NotesCalendar } from '@/features/calendar/components/notes-calendar';

describe('NotesCalendar', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('disables future dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 29, 12, 0, 0));

    const { container } = render(<NotesCalendar noteCountsByDate={[]} />);

    const today = new Date(2026, 5, 29);
    const tomorrow = new Date(2026, 5, 30);

    const dayButtons = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button[data-day]'),
    );

    const todayKey = today.toLocaleDateString();
    const tomorrowKey = tomorrow.toLocaleDateString();

    const todayButton = dayButtons.find((b) => b.getAttribute('data-day') === todayKey);
    const tomorrowButton = dayButtons.find((b) => b.getAttribute('data-day') === tomorrowKey);

    expect(todayButton).toBeTruthy();
    expect(tomorrowButton).toBeTruthy();
    expect(todayButton).not.toBeDisabled();
    expect(tomorrowButton).toBeDisabled();
  });

  it('disables navigation to months after the current month', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 29, 12, 0, 0));

    render(<NotesCalendar noteCountsByDate={[]} />);

    const nextMonthButton = screen.getByRole('button', { name: /next month/i });
    const isDisabled =
      nextMonthButton.getAttribute('aria-disabled') === 'true' ||
      (nextMonthButton as HTMLButtonElement).disabled;

    expect(isDisabled).toBe(true);
  });
});
