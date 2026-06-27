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
  onReorderItems: (items: string[]) => void;
}

const moveItem = (items: string[], fromIndex: number, toIndex: number) => {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
};

export const QuickSearchSection = (props: QuickSearchSectionProps) => {
  const { items, onClickItem, onAddItem, onRemoveItem, onReorderItems } = props;
  const [addOpen, setAddOpen] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

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

  const handleDrop = (targetItem: string) => {
    if (!draggedItem || draggedItem === targetItem) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const fromIndex = items.indexOf(draggedItem);
    const toIndex = items.indexOf(targetItem);
    if (fromIndex === -1 || toIndex === -1) return;

    onReorderItems(moveItem(items, fromIndex, toIndex));
    setDraggedItem(null);
    setDragOverItem(null);
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
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', item);
              setDraggedItem(item);
            }}
            onDragEnd={() => {
              setDraggedItem(null);
              setDragOverItem(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              setDragOverItem(item);
            }}
            onDragLeave={() => {
              if (dragOverItem === item) setDragOverItem(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(item);
            }}
            className={`flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-sidebar-accent group ${
              draggedItem === item ? 'opacity-50' : ''
            } ${dragOverItem === item && draggedItem !== item ? 'bg-sidebar-accent' : ''}`}
          >
            <span
              aria-hidden='true'
              className='mr-1 cursor-grab select-none text-muted-foreground opacity-0 group-hover:opacity-100 group-active:cursor-grabbing'
            >
              ⋮⋮
            </span>
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
