import { useEffect, useRef, useState } from 'react';
import { Reorder, useDragControls, useMotionValue } from 'motion/react';
import { RiAddLine, RiCloseLine, RiDraggable } from '@remixicon/react';
import { Spinner } from '@/components/ui/spinner.tsx';
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
  isLoading?: boolean;
  onClickItem: (value: string) => void;
  onAddItem: (value: string) => void;
  onRemoveItem: (value: string) => void;
  onReorderItems: (items: string[]) => void;
}

interface QuickSearchItemProps {
  item: string;
  onClickItem: (value: string) => void;
  onSetRemoveTarget: (value: string) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const QuickSearchItem = (props: QuickSearchItemProps) => {
  const { item, onClickItem, onSetRemoveTarget, onDragStart, onDragEnd } = props;
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Reorder.Item
      value={item}
      style={{ y, zIndex: isDragging ? 10 : 0, position: 'relative' }}
      dragControls={dragControls}
      dragListener={false}
      transition={{ type: 'spring', stiffness: 1200, damping: 80, mass: 0.3 }}
      dragTransition={{ bounceStiffness: 1000, bounceDamping: 100 }}
      onDragStart={() => {
        setIsDragging(true);
        onDragStart();
      }}
      onDragEnd={() => {
        setIsDragging(false);
        onDragEnd();
      }}
      className='flex items-center justify-between rounded-md pl-0 pr-1 py-1.5 hover:bg-sidebar-accent group list-none bg-sidebar'
    >
      <RiDraggable
        className='size-3.5 mr-1 shrink-0 cursor-grab select-none text-muted-foreground active:cursor-grabbing'
        onPointerDown={(e) => dragControls.start(e)}
      />
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
        onClick={() => onSetRemoveTarget(item)}
        className='opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground ml-1 shrink-0'
      >
        <RiCloseLine className='size-3.5' />
      </button>
    </Reorder.Item>
  );
};

export const QuickSearchSection = (props: QuickSearchSectionProps) => {
  const { items, isLoading, onClickItem, onAddItem, onRemoveItem, onReorderItems } = props;
  const [addOpen, setAddOpen] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [localOrder, setLocalOrder] = useState(items);
  const latestOrderRef = useRef(items);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalOrder(items);
      latestOrderRef.current = items;
    }
  }, [items]);

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

      {isLoading ? (
        <p className='text-sm text-muted-foreground flex gap-1 px-1 mt-3'>
          <Spinner className='my-auto' />
          Loading...
        </p>
      ) : localOrder.length === 0 ? (
        <p className='text-sm text-muted-foreground px-1 mt-3'>No quick search items.</p>
      ) : (
        <Reorder.Group
          axis='y'
          values={localOrder}
          onReorder={(newOrder) => {
            setLocalOrder(newOrder);
            latestOrderRef.current = newOrder;
          }}
          className='space-y-0 list-none p-0 m-0'
        >
          {localOrder.map((item) => (
            <QuickSearchItem
              key={item}
              item={item}
              onClickItem={onClickItem}
              onSetRemoveTarget={setRemoveTarget}
              onDragStart={() => {
                isDraggingRef.current = true;
              }}
              onDragEnd={() => {
                isDraggingRef.current = false;
                onReorderItems(latestOrderRef.current);
              }}
            />
          ))}
        </Reorder.Group>
      )}

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
