'use client';

import { useState } from 'react';
import MarkdownIt from 'markdown-it';
import { NoteEditorDialog } from '@/features/notes/components/note-editor-dialog';
import { NoteViewDialog } from '@/features/notes/components/note-view-dialog';

type NoteCardProps = {
  content: string;
  onSave?: (data: string) => void;
};

export const NoteCard = ({ content, onSave }: NoteCardProps) => {
  const [mode, setMode] = useState<'closed' | 'view' | 'edit'>('closed');
  const htmlContent = new MarkdownIt().render(content);

  return (
    <>
      <button
        aria-label='Open note'
        className='w-full max-w-md cursor-pointer rounded-2xl border border-border bg-white p-4 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md markdown'
        onClick={() => setMode('view')}
        type='button'
      >
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
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
