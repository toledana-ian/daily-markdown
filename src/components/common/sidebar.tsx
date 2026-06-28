import { SearchNote } from '@/features/search/components/search-note.tsx';
import { NotesCalendar } from '@/features/calendar/components/notes-calendar.tsx';
import { cn } from '@/lib/utils.ts';
import type { NoteCountByDate } from '@/features/calendar/hooks/useCalendar.ts';
import { QuickSearchSection } from '@/features/quick-search/sections/quick-search-section.tsx';

interface SidebarContentProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  setDisplayedDate: (date: Date) => void;
  noteCountsByDate: NoteCountByDate[];
  query: string;
  setQuery: (query: string) => void;
  onClearSearch?: () => void;
  quickSearchItems: string[];
  quickSearchItemsLoading?: boolean;
  onClickQuickSearchItem: (value: string) => void;
  onAddQuickSearchItem: (value: string) => void;
  onRemoveQuickSearchItem: (value: string) => void;
  onReorderQuickSearchItems: (items: string[]) => void;
}

const SidebarContent = (props: SidebarContentProps) => {
  const {
    selectedDate,
    setSelectedDate,
    setDisplayedDate,
    noteCountsByDate,
    query,
    setQuery,
    onClearSearch,
    quickSearchItems,
    quickSearchItemsLoading,
    onClickQuickSearchItem,
    onAddQuickSearchItem,
    onRemoveQuickSearchItem,
    onReorderQuickSearchItems,
  } = props;

  return (
    <div className='bg-sidebar w-72 flex h-full flex-col text-sidebar-foreground'>
      <nav aria-label='App sidebar' className='flex flex-1 flex-col p-4'>
        <div className='space-y-4'>
          <SearchNote query={query} setQuery={setQuery} onClear={onClearSearch} />

          <NotesCalendar
            selected={selectedDate}
            onSelect={setSelectedDate}
            noteCountsByDate={noteCountsByDate}
            onMonthChange={setDisplayedDate}
          />

          <QuickSearchSection
            items={quickSearchItems}
            isLoading={quickSearchItemsLoading}
            onClickItem={onClickQuickSearchItem}
            onAddItem={onAddQuickSearchItem}
            onRemoveItem={onRemoveQuickSearchItem}
            onReorderItems={onReorderQuickSearchItems}
          />
        </div>
      </nav>
    </div>
  );
};

interface SidebarProps extends SidebarContentProps {
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
}

export const Sidebar = (props: SidebarProps) => {
  const {
    isVisible,
    setVisible,
    selectedDate,
    setSelectedDate,
    setDisplayedDate,
    noteCountsByDate,
    query,
    setQuery,
    onClearSearch,
    quickSearchItems,
    quickSearchItemsLoading,
    onClickQuickSearchItem,
    onAddQuickSearchItem,
    onRemoveQuickSearchItem,
    onReorderQuickSearchItems,
  } = props;

  return (
    <>
      <aside
        className={cn(
          'hidden md:block shadow-xl transition duration-150 ease-in-out',
          isVisible ? 'translate-x-0' : '-translate-x-72 w-0',
        )}
      >
        <SidebarContent
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setDisplayedDate={setDisplayedDate}
          noteCountsByDate={noteCountsByDate}
          query={query}
          setQuery={setQuery}
          onClearSearch={onClearSearch}
          quickSearchItems={quickSearchItems}
          quickSearchItemsLoading={quickSearchItemsLoading}
          onClickQuickSearchItem={onClickQuickSearchItem}
          onAddQuickSearchItem={onAddQuickSearchItem}
          onRemoveQuickSearchItem={onRemoveQuickSearchItem}
          onReorderQuickSearchItems={onReorderQuickSearchItems}
        />
      </aside>

      <div
        className={cn(
          'fixed flex inset-0 z-40 bg-foreground/20 md:hidden transition-opacity duration-150 ease-in-out',
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      >
        <div
          role='dialog'
          aria-modal='true'
          aria-label='Sidebar navigation'
          className={cn(
            'h-full pt-14 w-72 max-w-[85vw] shadow-xl transition duration-150 ease-in-out',
            isVisible ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <SidebarContent
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setDisplayedDate={setDisplayedDate}
            noteCountsByDate={noteCountsByDate}
            query={query}
            setQuery={setQuery}
            onClearSearch={onClearSearch}
            quickSearchItems={quickSearchItems}
            quickSearchItemsLoading={quickSearchItemsLoading}
            onClickQuickSearchItem={onClickQuickSearchItem}
            onAddQuickSearchItem={onAddQuickSearchItem}
            onRemoveQuickSearchItem={onRemoveQuickSearchItem}
            onReorderQuickSearchItems={onReorderQuickSearchItems}
          />
        </div>
        <div
          className={'h-full w-full '}
          onClick={() => {
            setVisible(false);
          }}
        ></div>
      </div>
    </>
  );
};
