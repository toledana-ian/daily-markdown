import { useCalendarStore } from '@/features/calendar/store/calendar.ts';
import { supabase } from '@/lib/supabase/client.ts';
import { endOfMonth, startOfMonth } from 'date-fns';
import { useCallback, useState } from 'react';

export type NoteCountByDate = {
  date: Date;
  count: number;
};

type NoteCountsByDate = NoteCountByDate[];

type NoteCountByDateRow = {
  date: string;
  count: number;
};

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
    const normalizedSearchQuery = searchQuery?.trim();
    const { data, error } = await supabase.rpc('get_note_counts_by_date', {
      client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      start_date: startOfMonth(displayedDate).toISOString(),
      end_date: endOfMonth(displayedDate).toISOString(),
      search_query: normalizedSearchQuery || null,
    });

    if (error || !data) {
      return [];
    }

    return (data as NoteCountByDateRow[]).map((row) => ({
      date: new Date(row.date),
      count: row.count,
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
