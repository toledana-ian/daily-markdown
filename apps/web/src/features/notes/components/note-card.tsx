'use client';

import type { KeyboardEvent } from 'react';
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

  const openPreview = () => setMode('view');
  const openEditor = () => setMode('edit');
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPreview();
    }
  };

  return (
    <>
      <div
        aria-label='Open note'
        className='flex flex-col max-h-96 overflow-auto w-full sm:w-xs md:w-xs lg:w-xs  cursor-pointer rounded-sm bg-white p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md outline-0'
        onClick={openPreview}
        onDoubleClick={openEditor}
        onKeyDown={handleKeyDown}
        role='button'
        tabIndex={0}
      >
        <Markdown content={content} emptyMessage='This note is empty.' />
      </div>
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
