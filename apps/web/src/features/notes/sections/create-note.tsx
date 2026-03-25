import { CreateNote } from '@/features/notes/components/create-note.tsx';
import { useNotes } from '@/features/notes/hooks/use-notes.ts';
import { useNoteDateStore } from '@/features/notes/store/note-date.ts';
import { useNoteSearchStore } from '@/features/notes/store/note-search.ts';

export const CreateNoteSection = () => {
  const selectedDate = useNoteDateStore((state) => state.selectedDate);
  const query = useNoteSearchStore((state) => state.query);
  const { createNote } = useNotes({ date: selectedDate, query });

  return (
    <div className='flex flex-col items-center gap-4'>
      <CreateNote onSave={createNote} />
    </div>
  );
};
