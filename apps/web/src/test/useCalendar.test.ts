import { renderHook } from '@testing-library/react';
import { endOfMonth, startOfMonth } from 'date-fns';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useCalendar } from '@/features/calendar/hooks/useCalendar.ts';

const { rpc } = vi.hoisted(() => ({
  rpc: vi.fn(),
}));

vi.mock('@/lib/supabase/client.ts', () => ({
  supabase: {
    rpc,
  },
}));

describe('useCalendar', () => {
  beforeEach(() => {
    rpc.mockReset();
  });

  it('loads note counts by date from an aggregated rpc query', async () => {
    const displayedDate = new Date('2026-03-15T12:00:00.000Z');

    rpc.mockResolvedValue({
      data: [
        { date: '2026-03-02', count: 2 },
        { date: '2026-03-05', count: 1 },
      ],
      error: null,
    });

    const { result } = renderHook(() => useCalendar());

    const data = await result.current.loadNoteCountsByDate(displayedDate, '  release notes  ');

    expect(rpc).toHaveBeenCalledWith('get_note_counts_by_date', {
      client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      end_date: endOfMonth(displayedDate).toISOString(),
      search_query: 'release notes',
      start_date: startOfMonth(displayedDate).toISOString(),
    });
    expect(data).toEqual([
      { date: new Date('2026-03-02'), count: 2 },
      { date: new Date('2026-03-05'), count: 1 },
    ]);
  });
});
