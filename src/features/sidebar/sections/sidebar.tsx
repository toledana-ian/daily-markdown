import { Sidebar } from '@/components/common/sidebar.tsx';
import { useSidebar } from '@/features/sidebar/hooks/useSidebar.ts';
import { useCalendar } from '@/features/calendar/hooks/useCalendar.ts';
import { useSearch } from '@/features/search/hooks/useSearch.ts';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useQuickSearchItems } from '@/features/quick-search/hooks/use-quick-search-items.ts';
import { useCallback, useEffect } from 'react';

export const SidebarSection = () => {
  const { isVisible, setVisible } = useSidebar();
  const { selectedDate, displayedDate, setSelectedDate, setDisplayedDate, loadNoteCountsByDate } =
    useCalendar();
  const { query, setQuery } = useSearch();
  const { items, isLoading: quickSearchItemsLoading, loadItems, addItem, removeItem, reorderItems } = useQuickSearchItems();

  const { data: noteCountsByDate = [] } = useQuery({
    queryKey: ['note-counts-by-date', format(displayedDate, 'yyyy-MM'), query.trim()],
    queryFn: () => loadNoteCountsByDate(displayedDate, query),
  });

  const handleSetQuery = useCallback(
    (value: string) => {
      setQuery(value);
      if (value) setSelectedDate(null);
    },
    [setQuery, setSelectedDate],
  );

  const handleClearSearch = useCallback(() => {
    setSelectedDate(new Date());
  }, [setSelectedDate]);

  const onClickQuickSearchItem = useCallback(
    (value: string) => {
      handleSetQuery(value);
    },
    [handleSetQuery],
  );

  useEffect(() => {
    loadItems().then();
  }, [loadItems]);

  return (
    <>
      <Sidebar
        isVisible={isVisible}
        setVisible={setVisible}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        setDisplayedDate={setDisplayedDate}
        noteCountsByDate={noteCountsByDate}
        query={query}
        setQuery={handleSetQuery}
        onClearSearch={handleClearSearch}
        quickSearchItems={items}
        quickSearchItemsLoading={quickSearchItemsLoading}
        onClickQuickSearchItem={onClickQuickSearchItem}
        onAddQuickSearchItem={addItem}
        onRemoveQuickSearchItem={removeItem}
        onReorderQuickSearchItems={reorderItems}
      />
    </>
  );
};
