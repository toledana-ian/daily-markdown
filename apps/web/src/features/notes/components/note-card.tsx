'use client';

import { useMemo, useState } from 'react';
import {
  NoteEditorDialog,
  type NoteEditorSaveData,
} from '@/features/notes/components/note-editor-dialog';
import { NoteViewDialog } from '@/features/notes/components/note-view-dialog';

type NoteCardProps = {
  note: NoteEditorSaveData;
  onSave?: (data: NoteEditorSaveData) => void;
};

const getNoteTitle = (content: string) => {
  const firstLine = content
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine?.replace(/^#{1,6}\s*/, '') || 'Untitled note';
};

const getNotePreview = (content: string) => {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const body = (lines.length > 1 ? lines.slice(1) : lines)
    .join(' ')
    .replace(/^#{1,6}\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();

  return body || 'Double-click to edit this note.';
};

export const NoteCard = ({ note, onSave }: NoteCardProps) => {
  const [mode, setMode] = useState<'closed' | 'view' | 'edit'>('closed');
  const title = useMemo(() => getNoteTitle(note.content), [note.content]);
  const preview = useMemo(() => getNotePreview(note.content), [note.content]);

  return (
    <>
      <button
        aria-label='Open note'
        className='w-full max-w-md cursor-pointer rounded-2xl border border-border bg-white p-4 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md'
        onClick={() => setMode('view')}
        onDoubleClick={() => setMode('edit')}
        type='button'
      >
        <p className='text-sm font-semibold text-foreground'>{title}</p>
        <p className='mt-2 line-clamp-3 text-sm text-muted-foreground'>{preview}</p>
      </button>
      <NoteViewDialog
        data={note}
        onEdit={() => setMode('edit')}
        onOpenChange={(open) => setMode(open ? 'view' : 'closed')}
        open={mode === 'view'}
      />
      <NoteEditorDialog
        data={note}
        onOpenChange={(open) => setMode(open ? 'edit' : 'closed')}
        onSave={onSave}
        open={mode === 'edit'}
      />
    </>
  );
};
