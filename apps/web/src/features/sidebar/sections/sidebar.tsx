import { Sidebar } from '@/components/common/sidebar.tsx';
import { useNoteSearchStore } from '@/features/notes/store/note-search.ts';
import { useSidebar } from '@/features/sidebar/hooks/useSidebar.ts';
import { useCalendar } from '@/features/calendar/hooks/useCalendar.ts';

export const SidebarSection = () => {
  const { isVisible } = useSidebar();
  const { selectedDate, setSelectedDate } = useCalendar();
  const query = useNoteSearchStore((state) => state.query);
  const setQuery = useNoteSearchStore((state) => state.setQuery);

  return (
    <>
      <Sidebar
        isVisible={isVisible}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        query={query}
        setQuery={setQuery}
      />
    </>
  );
}