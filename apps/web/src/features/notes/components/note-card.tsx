import { useEffect, useRef } from 'react';
import { useState } from 'react';
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
  onDelete?: () => void | Promise<void>;
  onSave?: (data: string) => void | Promise<void>;
};

export const NoteCard = ({ content, onDelete, onSave }: NoteCardProps) => {
  const [mode, setMode] = useState<'closed' | 'view' | 'edit'>('closed');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const prevModeRef = useRef<'closed' | 'view' | 'edit'>(mode);
  const noteEditorRef = useRef<NoteEditorDialogRef | null>(null);

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
    if (!noteEditorRef.current) return;
    noteEditorRef.current.loadContent(content);
  }, [content])

  // const tags = ['#test', '#example', '#markdown']

  return (
    <>
      <div className='break-inside-avoid mb-4 relative w-full'>
        <NoteCardMenu
          onDelete={() => setIsDeleteDialogOpen(true)}
          onEdit={openEditor}
          onView={openPreview}
        >
          <NoteCardPreview content={content} onClick={openPreview} onDoubleClick={openEditor} />
        </NoteCardMenu>
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
