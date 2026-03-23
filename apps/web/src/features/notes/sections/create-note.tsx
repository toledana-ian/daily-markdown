'use client';

import { useState } from 'react';
import { CreateNote } from '@/features/notes/components/create-note.tsx';
import { NoteCard } from '@/features/notes/components/note-card.tsx';
import type { NoteEditorSaveData } from '@/features/notes/components/note-editor-dialog.tsx';

export const CreateNoteSection = () => {
  const [note, setNote] = useState<NoteEditorSaveData>({
    content: '# Daily note\n\nStart writing here.',
    html: '<h1>Daily note</h1>\n<p>Start writing here.</p>\n',
  });

  return (
    <div className='flex flex-col items-center gap-4'>
      <CreateNote onSave={setNote} />
      <NoteCard note={note} onSave={setNote} />
    </div>
  );
};
