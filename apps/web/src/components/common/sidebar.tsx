import { RiCloseLine, RiQuestionLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import { Calendar } from '@/components/ui/calendar.tsx';
import { Tag } from '@/features/tags/components/tag.tsx';

const temporaryHashtags = ['work', 'ideas', 'journal', 'personal'] as const;

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  return (
    <div className='flex h-full flex-col text-sidebar-foreground'>
      <nav aria-label='App sidebar' className='flex flex-1 flex-col px-4 py-4'>
        <div className='space-y-10'>
          <section aria-label='Sidebar calendar' className='overflow-hidden rounded-md'>
            <Calendar mode='single' selected={new Date()} className={'bg-transparent'} />
          </section>

          <section className='space-y-1'>
            <h2 className='px-1 text-xs font-semibold text-muted-foreground'>HASHTAGS</h2>
            <div className=''>
              {temporaryHashtags.map((hashtag) => (
                <Tag textContent={hashtag} />
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
          className='h-full max-h-[calc(100vh-3.5rem)] w-72 max-w-[85vw] border-r border-sidebar-border bg-sidebar shadow-xl'
          onClick={(event) => event.stopPropagation()}
        >
          <div className='flex items-center justify-end px-3 py-3'>
            <button
              type='button'
              aria-label='Close sidebar'
              className='rounded-md p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            >
              <RiCloseLine className='size-5' />
            </button>
          </div>
          <SidebarContent />
        </div>
      </div>
    </>
  );
};
