import { RiCloseLine, RiLayoutGridLine, RiStickyNoteLine } from '@remixicon/react';
import { Link } from '@tanstack/react-router';
const navigationItems = [
  {
    to: '/',
    label: 'Notes',
    icon: RiStickyNoteLine,
  },
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: RiLayoutGridLine,
  },
] as const;

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  return (
    <div className='flex h-full flex-col bg-sidebar text-sidebar-foreground'>
      <div className='border-b border-sidebar-border px-5 py-4'>
        <div className='font-mono text-sm font-semibold text-primary'>daily.md</div>
        <p className='mt-1 text-sm text-muted-foreground'>Authenticated workspace</p>
      </div>
      <nav aria-label='App sidebar' className='flex-1 px-3 py-4'>
        <div className='space-y-1'>
          {navigationItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className='flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              activeProps={{
                className:
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium bg-sidebar-primary text-sidebar-primary-foreground transition-colors',
              }}
            >
              <Icon className='size-4' />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

interface SidebarProps {
  isVisible: boolean;
}

export const Sidebar = (props: SidebarProps) => {
  const { isVisible } = props;

  return (
    <>
      <aside className='hidden w-72 shrink-0 border-r border-sidebar-border bg-sidebar md:block'>
        <SidebarContent />
      </aside>

      {isVisible && (
        <div className='fixed inset-0 z-40 bg-foreground/20'>
          <div
            role='dialog'
            aria-modal='true'
            aria-label='Sidebar navigation'
            className='h-full w-72 max-w-[85vw] border-r border-sidebar-border bg-sidebar shadow-xl'
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
      )}
    </>
  );
};
