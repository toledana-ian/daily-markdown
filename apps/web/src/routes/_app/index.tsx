import { createFileRoute } from '@tanstack/react-router';
import { NoteListSection } from '@/features/notes/sections/note-list.tsx';
import { NoteTitleSection } from '@/features/notes/sections/note-title.tsx';
import { NoteCreateSection } from '@/features/notes/sections/note-create.tsx';

const Screen = () => {
  return (
    <>
      <NoteTitleSection />
      <NoteCreateSection />
      <NoteListSection />
    </>
  );
};

export const Route = createFileRoute('/_app/')({
  component: Screen,
});
