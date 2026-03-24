import { CreateNote } from '@/features/notes/components/create-note.tsx';
import { NoteCard } from '@/features/notes/components/note-card.tsx';

export const CreateNoteSection = () => {
  return (
    <div className='flex flex-col items-center gap-4'>
      <CreateNote />
      <NoteCard content={'### Hello World :D'} />
    </div>
  );
};
