'use client';

import { RiQuestionLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import { Calendar } from '@/components/ui/calendar.tsx';
import { Tag } from '@/features/tags/components/tag.tsx';
import { SearchNote } from '@/features/notes/components/search-note.tsx';
import { useNoteDateStore } from '@/features/notes/store/note-date.ts';
import { useNoteSearchStore } from '@/features/notes/store/note-search.ts';

const temporaryHashtags = ['work', 'ideas', 'journal', 'personal'] as const;

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const selectedDate = useNoteDateStore((state) => state.selectedDate);
  const setSelectedDate = useNoteDateStore((state) => state.setSelectedDate);

  const query = useNoteSearchStore((state) => state.query);
  const setQuery = useNoteSearchStore((state) => state.setQuery);

  return (
    <div className='flex h-full flex-col text-sidebar-foreground'>
      <nav aria-label='App sidebar' className='flex flex-1 flex-col p-4'>
        <div className='space-y-4'>
          <SearchNote query={query} setQuery={setQuery} />

          <Calendar
            mode='single'
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date);
              }
            }}
            className={'bg-transparent'}
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
          onClick={onNavigate}
          className='mt-auto w-full justify-start gap-2 rounded-2xl border-sidebar-border bg-background/80'
        >
          <RiQuestionLine className='size-4' />
          <span>Help</span>
        </Button>
      </nav>
    </div>
  );
};

interface SidebarProps {
  isVisible: boolean;
}

export const Sidebar = (props: SidebarProps) => {
  const { isVisible } = props;

  if (!isVisible) return <></>;

  return (
    <>
      <aside className='hidden w-72 shrink-0 bg-sidebar md:block'>
        <SidebarContent />
      </aside>

      <div className='fixed inset-0 z-40 bg-foreground/20 md:hidden'>
        <div
          role='dialog'
          aria-modal='true'
          aria-label='Sidebar navigation'
          className='h-full pt-14 w-72 max-w-[85vw] bg-sidebar shadow-xl'
          onClick={(event) => event.stopPropagation()}
        >
          <SidebarContent />
        </div>
      </div>
    </>
  );
};
