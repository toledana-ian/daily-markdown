'use client';

import { type KeyboardEvent, useRef } from 'react';
import { useState } from 'react';
import { RiDeleteBinLine, RiEditLine, RiEyeLine, RiMore2Fill } from '@remixicon/react';
import { Markdown } from '@/components/common/markdown';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NoteEditorDialog } from '@/features/notes/components/note-editor-dialog';
import { NoteViewDialog } from '@/features/notes/components/note-view-dialog';

type NoteCardProps = {
  content: string;
  onDelete?: () => void | Promise<void>;
  onSave?: (data: string) => void | Promise<void>;
};

export const NoteCard = ({ content, onDelete, onSave }: NoteCardProps) => {
  const [mode, setMode] = useState<'closed' | 'view' | 'edit'>('closed');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const prevModeRef = useRef<'closed' | 'view' | 'edit'>(mode);

  const openPreview = () => {
    setMode('view');
    prevModeRef.current = 'view';
  }
  const closePreview = () => {
    setMode('closed');
    prevModeRef.current = 'closed';
  };
  const openEditor = () => {
    setMode('edit');
  }
  const closeEditor = () => {
    setMode(prevModeRef.current);
  }

  const handleDelete = () => {
    const result = onDelete?.();
    setIsDeleteDialogOpen(false);
    setMode('closed');
    return result;
  };

  return (
    <>
      <div className='relative w-full sm:w-xs md:w-xs lg:w-xs'>
        <div
          aria-label='Open note'
          className='flex max-h-96 cursor-pointer flex-col overflow-auto rounded-sm bg-white p-4 pr-12 shadow outline-0 transition hover:-translate-y-0.5 hover:shadow-md'
          onClick={openPreview}
          role='button'
          tabIndex={0}
        >
          <Markdown content={content} emptyMessage='This note is empty.' />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                aria-label='Note actions'
                className='absolute top-2 right-2'
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                size='icon-sm'
                variant='ghost'
              >
                <RiMore2Fill />
              </Button>
            }
          />
          <DropdownMenuContent align='end' className='w-auto rounded-sm shadow-xl'>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setMode('view')}>
                <RiEyeLine />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMode('edit')}>
                <RiEditLine />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} variant='destructive'>
                <RiDeleteBinLine />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <NoteViewDialog
        content={content}
        onEdit={() => setMode('edit')}
        onOpenChange={(open) => setMode(open ? 'view' : 'closed')}
        open={mode === 'view'}
      />
      <NoteEditorDialog
        initialContent={content}
        onOpenChange={(open) => setMode(open ? 'edit' : 'view')}
        onSave={onSave}
        open={mode === 'edit'}
      />
      <AlertDialog onOpenChange={setIsDeleteDialogOpen} open={isDeleteDialogOpen}>
        <AlertDialogContent size='sm'>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone and will permanently remove this note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant='destructive'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
