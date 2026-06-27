import type { ReactNode } from 'react';
import { RiDeleteBinLine, RiEditLine, RiEyeLine, RiPushpinFill, RiPushpinLine } from '@remixicon/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

type NoteCardMenuProps = {
  children: ReactNode;
  isPinned: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onPin: () => void;
  onView: () => void;
};

export const NoteCardMenu = ({ children, isPinned, onDelete, onEdit, onPin, onView }: NoteCardMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className='w-auto rounded-sm shadow-xl'>
        <ContextMenuGroup>
          <ContextMenuItem onClick={onView}>
            <RiEyeLine />
            View
          </ContextMenuItem>
          <ContextMenuItem onClick={onEdit}>
            <RiEditLine />
            Edit
          </ContextMenuItem>
          <ContextMenuItem onClick={onPin} className='items-start'>
            <span className='mt-0.5'>{isPinned ? <RiPushpinFill /> : <RiPushpinLine />}</span>
            <div className='flex flex-col'>
              <span>{isPinned ? 'Unpin' : 'Pin'}</span>
              <span className='text-xs text-muted-foreground leading-tight'>
                {isPinned ? 'Remove from today' : 'Always show on today\'s date'}
              </span>
            </div>
          </ContextMenuItem>
          <ContextMenuItem onClick={onDelete} variant='destructive'>
            <RiDeleteBinLine />
            Delete
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
};
