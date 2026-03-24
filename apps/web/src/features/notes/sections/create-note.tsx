import { CreateNote } from '@/features/notes/components/create-note.tsx';

export const CreateNoteSection = () => {
  return (
    <div className='flex flex-col items-center gap-4'>
      <CreateNote />
    </div>
  );
};
