import { cn } from '@/lib/utils.ts';
import { CreateNote } from '@/features/notes/components/create-note.tsx';
import type { NoteEditorDialogRef } from '@/features/notes/components/note-editor-dialog.tsx';
import { useNotes } from '@/features/notes/hooks/use-notes.ts';
import { useCallback, useRef } from 'react';

export const NoteCreateSection = () => {
  const { createNote, updateNote } = useNotes();

  const noteIdRef = useRef<string | null>(null);
  const noteEditorRef = useRef<NoteEditorDialogRef | null>(null);

  const onOpen = useCallback(() => {
    console.log("clearing content and id")
    if (!noteEditorRef.current) return;

    noteIdRef.current = null;
    noteEditorRef.current.clearContent();
  }, []);

  const onClose = useCallback(() => {

  }, []);

  const onSave = useCallback((content: string) => {
    console.log('saving note ', noteIdRef.current, content);
    if (noteIdRef.current) {
      console.log("update")
      updateNote(noteIdRef.current, content).then();
    } else {
      console.log("create")
      createNote(content).then((id) => {
        noteIdRef.current = id;
        console.log("new id: ", id)
      });
    }
  }, [createNote, updateNote]);

  return (
    <>
      <div className={cn('flex flex-row gap-2 justify-center')}>
        <CreateNote ref={noteEditorRef} onSave={onSave} onOpen={onOpen} onClose={onClose} />
      </div>
    </>
  );
};
