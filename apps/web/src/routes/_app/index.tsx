import { createFileRoute } from '@tanstack/react-router';
import { CreateNoteSection } from '@/features/notes/sections/create-note.tsx';
import { NoteListSection } from '@/features/notes/sections/note-list.tsx';

const Screen = () => {
  return (
    <>
      <CreateNoteSection />
      <NoteListSection />
    </>
  );
};

export const Route = createFileRoute('/_app/')({
  component: Screen,
});
