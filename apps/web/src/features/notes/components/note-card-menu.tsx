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
          <ContextMenuItem onClick={onPin}>
            {isPinned ? <RiPushpinFill /> : <RiPushpinLine />}
            {isPinned ? 'Unpin' : 'Pin'}
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
