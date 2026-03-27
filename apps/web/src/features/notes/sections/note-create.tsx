import { cn } from '@/lib/utils.ts';
import { CreateNote } from '@/features/notes/components/create-note.tsx';
import { useNotes } from '@/features/notes/hooks/use-notes.ts';
import { useNoteSearchStore } from '@/features/notes/store/note-search.ts';
import { useNoteDateStore } from '@/features/notes/store/note-date.ts';

export const NoteCreateSection = () => {
  const query = useNoteSearchStore((state) => state.query);
  const selectedDate = useNoteDateStore((state) => state.selectedDate);
  const { createNote } = useNotes({
    date: selectedDate,
    query,
  });

  return (
    <>
      <div className={cn('flex flex-row gap-2 justify-center')}>
        <CreateNote displayText={undefined} onSave={createNote} />
      </div>
    </>
  );
};
