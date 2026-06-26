import { useState } from 'react';
import { RiAddLine, RiCloseLine } from '@remixicon/react';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';

interface QuickSearchSectionProps {
  items: string[];
  onClickItem: (value: string) => void;
  onAddItem: (value: string) => void;
  onRemoveItem: (value: string) => void;
}

export const QuickSearchSection = (props: QuickSearchSectionProps) => {
  const { items, onClickItem, onAddItem, onRemoveItem } = props;
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    onAddItem(trimmed);
    setNewItem('');
  };

  return (
    <section className='space-y-1'>
      <h2 className='px-1 text-xs font-semibold text-muted-foreground'>QUICK SEARCH</h2>
      <div>
        {items.map((item) => (
          <div
            key={item}
            className='flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-sidebar-accent group'
          >
            <button
              type='button'
              className='flex-1 text-left text-sm text-sidebar-foreground truncate'
              onClick={() => onClickItem(item)}
            >
              {item}
            </button>
            <button
              type='button'
              aria-label={`Remove ${item}`}
              onClick={() => onRemoveItem(item)}
              className='opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground ml-1 shrink-0'
            >
              <RiCloseLine className='size-3.5' />
            </button>
          </div>
        ))}
      </div>
      <div className='flex gap-1 pt-1'>
        <Input
          type='text'
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          placeholder='Add search item...'
          className='h-7 text-xs bg-background/80 focus-visible:ring-0'
        />
        <Button
          type='button'
          size='icon'
          variant='ghost'
          className='h-7 w-7 shrink-0'
          onClick={handleAdd}
          aria-label='Add search item'
        >
          <RiAddLine className='size-3.5' />
        </Button>
      </div>
    </section>
  );
};
