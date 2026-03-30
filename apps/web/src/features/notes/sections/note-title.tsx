import { NoteListTitle } from '@/features/notes/components/note-list-title.tsx';
import { useNoteSearchStore } from '@/features/notes/store/note-search.ts';
import { useCalendar } from '@/features/calendar/hooks/useCalendar.ts';

export const NoteTitleSection = () => {
  const query = useNoteSearchStore((state) => state.query);
  const { selectedDate } = useCalendar();

  return (
    <>
      <div className={'flex justify-center mt-4 mb-2'}>
        <NoteListTitle date={selectedDate} searchValue={query} />
      </div>
    </>
  );
};
