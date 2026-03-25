import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Calendar } from '@/components/ui/calendar';

describe('Calendar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-03-24T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses the small radius token for its cell radius by default', () => {
    const { container } = render(<Calendar />);
    const calendarRoot = container.querySelector('[data-slot="calendar"]');

    expect(calendarRoot).not.toBeNull();
    expect(calendarRoot).toHaveClass('[--cell-radius:var(--radius-4xl)]');
  });

  it('does not apply focus border or ring styles to day buttons', () => {
    render(<Calendar mode='single' defaultMonth={new Date('2025-03-01T12:00:00Z')} />);
    const dayButton = screen.getByRole('button', { name: /today, monday, march 24th, 2025/i });

    expect(dayButton).not.toBeNull();
    expect(dayButton).not.toHaveClass('focus-visible:border-ring');
    expect(dayButton).not.toHaveClass('focus-visible:ring-[3px]');
    expect(dayButton).toHaveClass('focus-visible:border-transparent');
    expect(dayButton).toHaveClass('focus-visible:ring-0');
    expect(dayButton).not.toHaveClass('group-data-[focused=true]/day:border-ring');
    expect(dayButton).not.toHaveClass('group-data-[focused=true]/day:ring-[3px]');
  });
});
