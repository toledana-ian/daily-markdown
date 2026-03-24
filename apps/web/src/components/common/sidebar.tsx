'use client';

import { RiQuestionLine, RiSearchLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import { Calendar } from '@/components/ui/calendar.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useNoteSearchStore } from '@/features/notes/store/note-search.ts';
import { Tag } from '@/features/tags/components/tag.tsx';
import { SearchNote } from '@/features/notes/components/search-note.tsx';

const temporaryHashtags = ['work', 'ideas', 'journal', 'personal'] as const;

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const query = useNoteSearchStore((state) => state.query);
  const setQuery = useNoteSearchStore((state) => state.setQuery);

  return (
    <div className='flex h-full flex-col text-sidebar-foreground'>
      <nav aria-label='App sidebar' className='flex flex-1 flex-col p-4'>
        <div className='space-y-10'>
          <div className='relative'>
            <RiSearchLine
              aria-hidden='true'
              className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
            />
            <Input
              type='search'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search notes'
              aria-label='Search notes'
              className='bg-background/80 pl-9'
            />
          </div>

          <SearchNote />

          <section aria-label='Sidebar calendar' className='overflow-hidden rounded-md'>
            <Calendar mode='single' selected={new Date()} className={'bg-transparent'} />
          </section>

          <section className='space-y-1'>
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
      <aside className='hidden w-72 shrink-0 border-r border-sidebar-border bg-sidebar md:block'>
        <SidebarContent />
      </aside>

      <div className='fixed inset-0 z-40 bg-foreground/20 md:hidden'>
        <div
          role='dialog'
          aria-modal='true'
          aria-label='Sidebar navigation'
          className='h-full pt-14 w-72 max-w-[85vw] border-r border-sidebar-border bg-sidebar shadow-xl'
          onClick={(event) => event.stopPropagation()}
        >
          <SidebarContent />
        </div>
      </div>
    </>
  );
};
