import { useCalendarStore } from '@/features/calendar/store/calendar.ts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client.ts';
import { endOfMonth, format, startOfMonth } from 'date-fns';

export type NoteCountByDate = {
  date: Date;
  count: number;
};

type NoteCountsByDate = NoteCountByDate[];

async function loadNoteCountsByDate(displayedDate: Date): Promise<NoteCountsByDate> {
  const { data, error } = await supabase
    .from('notes')
    .select('created_at')
    .gte('created_at', startOfMonth(displayedDate).toISOString())
    .lte('created_at', endOfMonth(displayedDate).toISOString());

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
}

export const useCalendar = () => {
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const displayedDate = useCalendarStore((state) => state.displayedDate);
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);
  const setDisplayedDate = useCalendarStore((state) => state.setDisplayedDate);

  const { data: noteCountsByDate = [] } = useQuery({
    queryKey: ['note-counts-by-date', format(displayedDate, 'yyyy-MM')],
    queryFn: () => loadNoteCountsByDate(displayedDate),
  });

  return { selectedDate, displayedDate,  setSelectedDate, setDisplayedDate, noteCountsByDate };
};
