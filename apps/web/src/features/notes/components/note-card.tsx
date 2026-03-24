'use client';

import { useState } from 'react';
import { Markdown } from '@/components/common/markdown';
import { NoteEditorDialog } from '@/features/notes/components/note-editor-dialog';
import { NoteViewDialog } from '@/features/notes/components/note-view-dialog';

type NoteCardProps = {
  content: string;
  onSave?: (data: string) => void;
};

export const NoteCard = ({ content, onSave }: NoteCardProps) => {
  const [mode, setMode] = useState<'closed' | 'view' | 'edit'>('closed');

  return (
    <>
      <button
        aria-label='Open note'
        className='flex flex-col w-full max-w-xs max-h-52 cursor-pointer rounded-sm border border-border bg-white p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md outline-0'
        onClick={() => setMode('view')}
        type='button'
      >
        <Markdown content={content} emptyMessage='This note is empty.' />
      </button>
      <NoteViewDialog
        content={content}
        onEdit={() => setMode('edit')}
        onOpenChange={(open) => setMode(open ? 'view' : 'closed')}
        open={mode === 'view'}
      />
      <NoteEditorDialog
        initialContent={content}
        onOpenChange={(open) => setMode(open ? 'edit' : 'closed')}
        onSave={onSave}
        open={mode === 'edit'}
      />
    </>
  );
};
