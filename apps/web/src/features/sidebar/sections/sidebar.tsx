import { Sidebar } from '@/components/common/sidebar.tsx';
import { useSidebar } from '@/features/sidebar/hooks/useSidebar.ts';
import { useCalendar } from '@/features/calendar/hooks/useCalendar.ts';
import { useSearch } from '@/features/search/hooks/useSearch.ts';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

export const SidebarSection = () => {
  const { isVisible } = useSidebar();
  const { selectedDate, displayedDate, setSelectedDate, setDisplayedDate, loadNoteCountsByDate } =
    useCalendar();
  const { query, setQuery } = useSearch();

  const { data: noteCountsByDate = [] } = useQuery({
    queryKey: ['note-counts-by-date', format(displayedDate, 'yyyy-MM'), query.trim()],
    queryFn: () => loadNoteCountsByDate(displayedDate, query),
  });

  return (
    <>
      <Sidebar
        isVisible={isVisible}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        setDisplayedDate={setDisplayedDate}
        noteCountsByDate={noteCountsByDate}
        query={query}
        setQuery={setQuery}
      />
    </>
  );
};
