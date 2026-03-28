import { useRef } from 'react';
import { useState } from 'react';
import { RiDeleteBinLine, RiEditLine, RiEyeLine } from '@remixicon/react';
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
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

  // const tags = ['#test', '#example', '#markdown']

  return (
    <>
      <div className='relative w-full sm:w-xs md:w-xs lg:w-xs transition hover:-translate-y-0.5 hover:shadow-md'>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              aria-label='Open note'
              className='flex max-h-96 cursor-pointer flex-col overflow-auto rounded-sm bg-white p-4 shadow outline-0'
              onClick={openPreview}
              onDoubleClick={openEditor}
              role='button'
              tabIndex={0}
            >
              <Markdown content={content} emptyMessage='This note is empty.' />
            </div>
            {/*<div*/}
            {/*  className='absolute bottom-0 left-0 w-full h-16*/}
            {/*  bg-linear-to-t from-chart-1*/}
            {/*  pointer-events-none'*/}
            {/*>*/}
            {/*  <div className={'flex flex-row bg-red-300  my-auto gap-2 '}>*/}
            {/*    {tags.map((tag, index) => (*/}
            {/*      <span key={index} className='text-xs text-gray-500'>*/}
            {/*        {tag}*/}
            {/*      </span>*/}
            {/*    ))}*/}
            {/*  </div>*/}
            {/*</div>*/}
          </ContextMenuTrigger>
          <ContextMenuContent className='w-auto rounded-sm shadow-xl'>
            <ContextMenuGroup>
              <ContextMenuItem onClick={openPreview}>
                <RiEyeLine />
                View
              </ContextMenuItem>
              <ContextMenuItem onClick={openEditor}>
                <RiEditLine />
                Edit
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setIsDeleteDialogOpen(true)} variant='destructive'>
                <RiDeleteBinLine />
                Delete
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>
      </div>
      <NoteViewDialog
        content={content}
        onEdit={() => setMode('edit')}
        onOpenChange={(open) => {
          if (open) openPreview();
          else closePreview();
        }}
        open={mode === 'view'}
      />
      <NoteEditorDialog
        initialContent={content}
        onOpenChange={(open) => {
          if (open) openEditor();
          else closeEditor();
        }}
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
