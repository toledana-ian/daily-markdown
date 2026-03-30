import { useCalendarStore } from '@/features/calendar/store/calendar.ts';
import { supabase } from '@/lib/supabase/client.ts';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { useCallback, useState } from 'react';

export type NoteCountByDate = {
  date: Date;
  count: number;
};

type NoteCountsByDate = NoteCountByDate[];

export const useCalendar = () => {
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const displayedDate = useCalendarStore((state) => state.displayedDate);
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);
  const setDisplayedDate = useCalendarStore((state) => state.setDisplayedDate);
  const [noteCountsByDate, setNoteCountsByDate] = useState<NoteCountsByDate>([]);

  const loadNoteCountsByDate = useCallback(async function loadNoteCountsByDate(
    displayedDate: Date,
    searchQuery?: string,
  ): Promise<NoteCountsByDate> {
    let query = supabase
      .from('notes')
      .select('created_at')
      .gte('created_at', startOfMonth(displayedDate).toISOString())
      .lte('created_at', endOfMonth(displayedDate).toISOString());

    const normalizedSearchQuery = searchQuery?.trim();

    if (normalizedSearchQuery) {
      query = query.textSearch('search', normalizedSearchQuery, {
        config: 'english',
        type: 'websearch',
      });
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return Array.from(
      data.reduce((countMap, row) => {
        const key = format(new Date(row.created_at), 'yyyy-MM-dd');
        countMap.set(key, (countMap.get(key) ?? 0) + 1);
        return countMap;
      }, new Map<string, number>()),
    ).map(([key, count]) => ({
      date: new Date(key),
      count,
    }));
  }, []);



  return {
    selectedDate,
    displayedDate,
    setSelectedDate,
    setDisplayedDate,
    noteCountsByDate,
    setNoteCountsByDate,
    loadNoteCountsByDate,
  };
};
