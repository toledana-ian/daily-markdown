import { cn } from '@/lib/utils.ts';
import { CreateNote } from '@/features/notes/components/create-note.tsx';
import { useNotes } from '@/features/notes/hooks/use-notes.ts';
import { useCallback, useRef } from 'react';

export const NoteCreateSection = () => {
  const { createNote, updateNote } = useNotes();

  const noteIdRef = useRef<string|null>(null);

  const onOpen = () => {
    console.log('onOpen');
  };

  const onClose = () => {
    console.log('onClose');
    noteIdRef.current = null;
  };

  const onSave = useCallback((content:string)=>{
    if(noteIdRef.current) {
      console.log('Updating note with content:', content);
      updateNote(noteIdRef.current, content).then()
    } else {
      console.log('Creating new note with content:', content);
      createNote(content).then((id)=>{
        noteIdRef.current = id;
      })
    }
  }, [createNote, updateNote])

  return (
    <>
      <div className={cn('flex flex-row gap-2 justify-center')}>
        <CreateNote onSave={onSave} onOpen={onOpen} onClose={onClose} />
      </div>
    </>
  );
};
