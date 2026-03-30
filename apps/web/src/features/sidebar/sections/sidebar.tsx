import { Sidebar } from '@/components/common/sidebar.tsx';
import { useSidebar } from '@/features/sidebar/hooks/useSidebar.ts';
import { useCalendar } from '@/features/calendar/hooks/useCalendar.ts';
import { useSearch } from '@/features/search/hooks/useSearch.ts';

export const SidebarSection = () => {
  const { isVisible } = useSidebar();
  const { selectedDate, setSelectedDate, setDisplayedDate, noteCountsByDate } =
    useCalendar();
  const { query, setQuery } = useSearch();

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
