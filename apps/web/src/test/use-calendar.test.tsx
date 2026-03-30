import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCalendar } from '@/features/calendar/hooks/useCalendar.ts';
import { useCalendarStore } from '@/features/calendar/store/calendar.ts';

describe('useCalendar', () => {
  beforeEach(() => {
    useCalendarStore.setState({
      selectedDate: new Date('2026-03-30T00:00:00.000Z'),
    });
  });

  it('exposes the selected date and setter from the calendar store', () => {
    const nextDate = new Date('2026-03-31T00:00:00.000Z');
    const { result } = renderHook(() => useCalendar());

    expect(result.current.selectedDate).toEqual(new Date('2026-03-30T00:00:00.000Z'));

    act(() => {
      result.current.setSelectedDate(nextDate);
    });

    expect(result.current.selectedDate).toEqual(nextDate);
    expect(useCalendarStore.getState().selectedDate).toEqual(nextDate);
  });
});
