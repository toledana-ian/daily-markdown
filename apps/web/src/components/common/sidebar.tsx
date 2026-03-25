import { RiQuestionLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import { Tag } from '@/features/tags/components/tag.tsx';
import { SearchNote } from '@/features/notes/components/search-note.tsx';
import { NotesCalendar } from '@/features/notes/components/notes-calendar.tsx';
import { cn } from '@/lib/utils.ts';

const temporaryHashtags = ['work', 'ideas', 'journal', 'personal'] as const;

interface SidebarContentProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  query: string;
  setQuery: (query: string) => void;
}

const SidebarContent = (props: SidebarContentProps) => {
  const { selectedDate, setSelectedDate, query, setQuery } = props;

  return (
    <div className='bg-sidebar w-72 flex h-full flex-col text-sidebar-foreground'>
      <nav aria-label='App sidebar' className='flex flex-1 flex-col p-4'>
        <div className='space-y-4'>
          <SearchNote query={query} setQuery={setQuery} />

          <NotesCalendar selected={selectedDate} onSelect={setSelectedDate} noteCountsByDate={[]} />

          <section className='space-y-1 mt-8'>
            <h2 className='px-1 text-xs font-semibold text-muted-foreground'>HASHTAGS</h2>
            <div className=''>
              {temporaryHashtags.map((hashtag) => (
                <Tag key={hashtag} textContent={hashtag} />
              ))}
            </div>
          </section>
        </div>

        <Button
          type='button'
          variant='outline'
          className='mt-auto w-full justify-start gap-2 rounded-2xl border-sidebar-border bg-background/80'
        >
          <RiQuestionLine className='size-4' />
          <span>Help</span>
        </Button>
      </nav>
    </div>
  );
};

interface SidebarProps extends SidebarContentProps {
  isVisible: boolean;
}

export const Sidebar = (props: SidebarProps) => {
  const { isVisible, selectedDate, setSelectedDate, query, setQuery } = props;

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
          query={query}
          setQuery={setQuery}
        />
      </aside>

      <div
        className={cn(
          'fixed inset-0 z-40 bg-foreground/20 md:hidden transition-opacity duration-150 ease-in-out',
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
            query={query}
            setQuery={setQuery}
          />
        </div>
      </div>
    </>
  );
};
