import { RiQuestionLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import { Tag } from '@/features/tags/components/tag.tsx';
import { SearchNote } from '@/features/notes/components/search-note.tsx';
import { NotesCalendar } from '@/features/notes/components/notes-calendar.tsx';

const temporaryHashtags = ['work', 'ideas', 'journal', 'personal'] as const;

interface SidebarContentProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  query: string;
  setQuery: (query: string) => void;
}

const SidebarContent = (props: SidebarContentProps) => {
  const { selectedDate, setSelectedDate, query, setQuery } = props;

  return (
    <div className='flex h-full flex-col text-sidebar-foreground'>
      <nav aria-label='App sidebar' className='flex flex-1 flex-col p-4'>
        <div className='space-y-4'>
          <SearchNote query={query} setQuery={setQuery} />

          <NotesCalendar
            selected={selectedDate}
            onSelect={setSelectedDate}
            noteCountsByDate={[
              { date: new Date('2026-03-05T00:00:00Z'), count: 25 },
              { date: new Date('2026-03-06T00:00:00Z'), count: 20 },
              { date: new Date('2026-03-07T00:00:00Z'), count: 15 },
              { date: new Date('2026-03-08T00:00:00Z'), count: 10 },
              { date: new Date('2026-03-09T00:00:00Z'), count: 5 },
              { date: new Date('2026-03-09T00:00:00Z'), count: 0 },
            ]}
          />

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

  if (!isVisible) return <></>;

  return (
    <>
      <aside className='hidden w-72 shrink-0 bg-sidebar md:block'>
        <SidebarContent
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          query={query}
          setQuery={setQuery}
        />
      </aside>

      <div className='fixed inset-0 z-40 bg-foreground/20 md:hidden'>
        <div
          role='dialog'
          aria-modal='true'
          aria-label='Sidebar navigation'
          className='h-full pt-14 w-72 max-w-[85vw] bg-sidebar shadow-xl'
          onClick={(event) => event.stopPropagation()}
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
