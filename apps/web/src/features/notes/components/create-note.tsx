'use client';

import { useEffect, useState } from 'react';
import { NoteEditorDialog } from '@/features/notes/components/note-editor-dialog';
import { RiAddFill } from '@remixicon/react';

type CreateNoteProps = {
  onSave?: (data: string) => void | Promise<void>;
  onOpen?: () => void | Promise<void>;
  onClose?: () => void | Promise<void>;
};

export const CreateNote = ({ onSave, onOpen, onClose }: CreateNoteProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if(open && onOpen) {
      onOpen()
    }
    if(!open && onClose) {
      onClose()
    }
  }, [onClose, onOpen, open])

  return (
    <>
      <button
        className='w-full  flex flex-row justify-between max-w-md cursor-pointer rounded-sm bg-white p-4 text-left text-sm text-gray-400 outline-0 shadow-md'
        onClick={() => setOpen(true)}
        type='button'
      >
        <div className={'my-auto'}>Take a note...</div>
        <div className={''}>
          <RiAddFill />
        </div>
      </button>
      <NoteEditorDialog initialContent={''} onOpenChange={setOpen} onSave={onSave} open={open} />
    </>
  );
};
