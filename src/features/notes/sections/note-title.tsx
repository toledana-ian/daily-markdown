import { NoteListTitle } from '@/features/notes/components/note-list-title.tsx';
import { useCalendar } from '@/features/calendar/hooks/useCalendar.ts';
import { useSearch } from '@/features/search/hooks/useSearch.ts';

export const NoteTitleSection = () => {
  const { query } = useSearch();
  const { selectedDate } = useCalendar();

  return (
    <>
      <div className={'flex justify-center mt-4 mb-2'}>
        <NoteListTitle date={selectedDate} searchValue={query} />
      </div>
    </>
  );
};
