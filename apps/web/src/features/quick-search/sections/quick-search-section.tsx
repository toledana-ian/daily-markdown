import { useState } from 'react';
import { RiAddLine, RiCloseLine } from '@remixicon/react';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx';

interface QuickSearchSectionProps {
  items: string[];
  onClickItem: (value: string) => void;
  onAddItem: (value: string) => void;
  onRemoveItem: (value: string) => void;
}

export const QuickSearchSection = (props: QuickSearchSectionProps) => {
  const { items, onClickItem, onAddItem, onRemoveItem } = props;
  const [addOpen, setAddOpen] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const handleConfirmAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    onAddItem(trimmed);
    setNewItem('');
    setAddOpen(false);
  };

  const handleConfirmRemove = () => {
    if (removeTarget) {
      onRemoveItem(removeTarget);
      setRemoveTarget(null);
    }
  };

  return (
    <section className='space-y-1'>
      <div className='flex items-center justify-between px-1'>
        <h2 className='text-xs font-semibold text-muted-foreground'>QUICK SEARCH</h2>
        <button
          type='button'
          aria-label='Add quick search item'
          onClick={() => setAddOpen(true)}
          className='text-muted-foreground hover:text-foreground'
        >
          <RiAddLine className='size-3.5' />
        </button>
      </div>

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
              onClick={() => setRemoveTarget(item)}
              className='opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground ml-1 shrink-0'
            >
              <RiCloseLine className='size-3.5' />
            </button>
          </div>
        ))}
      </div>

      <Dialog open={addOpen} onOpenChange={(open) => setAddOpen(open)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Add Quick Search Item</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            type='text'
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirmAdd();
            }}
            placeholder='Search term...'
          />
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setAddOpen(false);
                setNewItem('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmAdd} disabled={!newItem.trim()}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        <AlertDialogContent size='sm'>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete search item?</AlertDialogTitle>
            <AlertDialogDescription>
              "{removeTarget}" will be removed from your quick search items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemoveTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant='destructive' onClick={handleConfirmRemove}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
