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
import { useNotesStore } from '@/features/notes/store/notes.ts';

type NoteCardProps = {
  id: string;
  content: string;
  isPinned?: boolean;
  onDelete?: () => void | Promise<void>;
  onPin?: () => void | Promise<void>;
  onSave?: (data: string) => void | Promise<void>;
};

export const NoteCard = ({ id, content, isPinned = false, onDelete, onPin, onSave }: NoteCardProps) => {
  const [mode, setMode] = useState<'closed' | 'view' | 'edit'>('closed');
  const [isViewDirty, setIsViewDirty] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const prevModeRef = useRef<'closed' | 'view' | 'edit'>(mode);
  const noteEditorRef = useRef<NoteEditorDialogRef | null>(null);
  const protectNote = useNotesStore((state) => state.protectNote);
  const unprotectNote = useNotesStore((state) => state.unprotectNote);

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

  useEffect(() => {
    const shouldProtect = mode === 'edit' || (mode === 'view' && isViewDirty);

    if (!shouldProtect) {
      return;
    }

    protectNote(id);

    return () => {
      unprotectNote(id);
    };
  }, [id, isViewDirty, mode, protectNote, unprotectNote]);

  useEffect(() => {
    if (mode === 'edit' || !noteEditorRef.current) return;
    noteEditorRef.current.loadContent(content);
  }, [content, mode]);

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
        onDirtyChange={setIsViewDirty}
        onEdit={() => setMode('edit')}
        onOpenChange={(open) => {
          if (open) openPreview();
          else closePreview();
        }}
        onSave={onSave}
        open={mode === 'view'}
      />
      <NoteEditorDialog
        initialContent={content}
        ref={noteEditorRef}
        onOpenChange={(open) => {
          if (open) openEditor();
          else closeEditor();
        }}
        onSave={onSave}
        open={mode === 'edit'}
      />
      <NoteCardDeleteDialog
        onConfirm={handleDelete}
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
      />
    </>
  );
};
