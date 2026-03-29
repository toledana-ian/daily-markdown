import { cn } from '@/lib/utils.ts';
import { CreateNote } from '@/features/notes/components/create-note.tsx';
import { useNotes } from '@/features/notes/hooks/use-notes.ts';

export const NoteCreateSection = () => {
  const { createNote } = useNotes();

  return (
    <>
      <div className={cn('flex flex-row gap-2 justify-center')}>
        <CreateNote displayText={undefined} onSave={createNote} />
      </div>
    </>
  );
};
