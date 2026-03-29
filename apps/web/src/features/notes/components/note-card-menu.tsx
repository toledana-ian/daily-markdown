import type { ReactNode } from 'react';
import { RiDeleteBinLine, RiEditLine, RiEyeLine } from '@remixicon/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

type NoteCardMenuProps = {
  children: ReactNode;
  onDelete: () => void;
  onEdit: () => void;
  onView: () => void;
};

export const NoteCardMenu = ({ children, onDelete, onEdit, onView }: NoteCardMenuProps) => {
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
          <ContextMenuItem onClick={onDelete} variant='destructive'>
            <RiDeleteBinLine />
            Delete
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
};
