import { createFileRoute } from '@tanstack/react-router';
import { CreateNote } from '@/features/notes/components/create-note.tsx';

const Screen = () => {
  return (
    <>
      <div className='flex flex-col items-center justify-center'>
        <CreateNote />
      </div>
    </>
  );
};

export const Route = createFileRoute('/_app/')({
  component: Screen,
});
