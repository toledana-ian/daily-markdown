import { createFileRoute } from '@tanstack/react-router';
import { CreateNoteSection } from '@/features/notes/sections/create-note.tsx';

const Screen = () => {
  return (
    <>
      <CreateNoteSection />
    </>
  );
};

export const Route = createFileRoute('/_app/')({
  component: Screen,
});
