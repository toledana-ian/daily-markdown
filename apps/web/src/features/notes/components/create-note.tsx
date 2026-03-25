'use client';

import { useState } from 'react';
import { NoteEditorDialog } from '@/features/notes/components/note-editor-dialog';
import { RiAddFill } from '@remixicon/react';

type CreateNoteProps = {
  displayText?: string;
  onSave?: (data: string) => void | Promise<void>;
};

export const CreateNote = ({ onSave, displayText }: CreateNoteProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className='w-full  flex flex-row justify-between max-w-md cursor-pointer rounded-sm bg-white p-4 text-left text-sm text-gray-400 outline-0 shadow-md'
        onClick={() => setOpen(true)}
        type='button'
      >
        <div className={'my-auto'}>{displayText ?? 'Take a note...'}</div>
        <div className={''}>
          <RiAddFill />
        </div>
      </button>
      <NoteEditorDialog initialContent={''} onOpenChange={setOpen} onSave={onSave} open={open} />
    </>
  );
};
