'use client';

import { useState } from 'react';
import { NoteEditorDialog } from '@/features/notes/components/note-editor-dialog';

type CreateNoteProps = {
  onSave?: (data: string) => void;
};

export const CreateNote = ({ onSave }: CreateNoteProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className='w-full max-w-md cursor-pointer rounded-sm border-2 bg-white p-4 text-left text-sm text-gray-400'
        onClick={() => setOpen(true)}
        type='button'
      >
        Take a note...
      </button>
      <NoteEditorDialog initialContent={''} onOpenChange={setOpen} onSave={onSave} open={open} />
    </>
  );
};
