import { createFileRoute } from '@tanstack/react-router';
import { NoteListSection } from '@/features/notes/sections/note-list.tsx';

const Screen = () => {
  return (
    <>
      <NoteListSection />
    </>
  );
};

export const Route = createFileRoute('/_app/')({
  component: Screen,
});
