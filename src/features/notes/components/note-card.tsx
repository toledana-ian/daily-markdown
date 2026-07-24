import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { RiPushpinFill } from '@remixicon/react';
import { NoteCardDeleteDialog } from '@/features/notes/components/note-card-delete-dialog';
import { NoteCardMenu } from '@/features/notes/components/note-card-menu';
import { NoteCardPreview } from '@/features/notes/components/note-card-preview';
import {
  NoteEditorDialog,
  type NoteEditorDialogRef,
} from '@/features/notes/components/note-editor-dialog';
import { NoteViewDialog } from '@/features/notes/components/note-view-dialog';

type NoteCardProps = {
  content: string;
  isPinned?: boolean;
  onDelete?: () => void | Promise<void>;
  onPin?: () => void | Promise<void>;
  onSave?: (data: string) => void | Promise<void>;
};

export const NoteCard = ({ content, isPinned = false, onDelete, onPin, onSave }: NoteCardProps) => {
  const [mode, setMode] = useState<'closed' | 'view' | 'edit'>('closed');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const prevModeRef = useRef<'closed' | 'view' | 'edit'>(mode);
  const noteEditorRef = useRef<NoteEditorDialogRef | null>(null);
  const dialogScrollTopRef = useRef({ edit: 0, view: 0 });
  const [initialDialogScrollTop, setInitialDialogScrollTop] = useState({ edit: 0, view: 0 });

  const openPreview = () => {
    setInitialDialogScrollTop((current) => ({
      ...current,
      view: dialogScrollTopRef.current.view,
    }));
    setMode('view');
    prevModeRef.current = 'view';
  };
  const closePreview = () => {
    setMode('closed');
    prevModeRef.current = 'closed';
  };
  const openEditor = () => {
    setInitialDialogScrollTop((current) => ({
      ...current,
      edit: dialogScrollTopRef.current.edit,
    }));
    setMode('edit');
  };
  const openEditorFromPreview = () => {
    dialogScrollTopRef.current.edit = dialogScrollTopRef.current.view;
    setInitialDialogScrollTop((current) => ({
      ...current,
      edit: dialogScrollTopRef.current.edit,
    }));
    setMode('edit');
  };
  const closeEditor = () => {
    if (prevModeRef.current === 'view') {
      dialogScrollTopRef.current.view = dialogScrollTopRef.current.edit;
      setInitialDialogScrollTop((current) => ({
        ...current,
        view: dialogScrollTopRef.current.view,
      }));
    }
    setMode(prevModeRef.current);
  };

  const handleDelete = () => {
    const result = onDelete?.();
    setIsDeleteDialogOpen(false);
    setMode('closed');
    return result;
  };

  useEffect(() => {
    if (!noteEditorRef.current) return;
    noteEditorRef.current.loadContent(content);
  }, [content]);

  return (
    <>
      <div className='break-inside-avoid mb-4 relative w-full group'>
        <NoteCardMenu
          isPinned={isPinned}
          onDelete={() => setIsDeleteDialogOpen(true)}
          onEdit={openEditor}
          onPin={() => onPin?.()}
          onView={openPreview}
        >
          <NoteCardPreview content={content} onClick={openPreview} />
        </NoteCardMenu>
        {isPinned && (
          <div className='absolute top-2 right-2 text-muted-foreground pointer-events-none transition group-hover:-translate-y-0.5'>
            <RiPushpinFill className='size-3.5' />
          </div>
        )}
      </div>
      <NoteViewDialog
        content={content}
        onEdit={openEditorFromPreview}
        onOpenChange={(open) => {
          if (open) openPreview();
          else closePreview();
        }}
        onSave={onSave}
        onScrollTopChange={(scrollTop) => {
          dialogScrollTopRef.current.view = scrollTop;
        }}
        open={mode === 'view'}
        scrollTop={initialDialogScrollTop.view}
      />
      <NoteEditorDialog
        initialContent={content}
        ref={noteEditorRef}
        onOpenChange={(open) => {
          if (open) openEditor();
          else closeEditor();
        }}
        onSave={onSave}
        onScrollTopChange={(scrollTop) => {
          dialogScrollTopRef.current.edit = scrollTop;
        }}
        open={mode === 'edit'}
        scrollTop={initialDialogScrollTop.edit}
      />
      <NoteCardDeleteDialog
        onConfirm={handleDelete}
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
      />
    </>
  );
};
