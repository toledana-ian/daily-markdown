import { NoteCard } from '@/features/notes/components/note-card.tsx';
import { useNotes } from '@/features/notes/hooks/use-notes.ts';
import { Spinner } from '@/components/ui/spinner.tsx';
import { useCallback, useEffect, useRef } from 'react';
import { useCalendar } from '@/features/calendar/hooks/useCalendar.ts';
import { useSearch } from '@/features/search/hooks/useSearch.ts';

export const NoteListSection = () => {
  const { query } = useSearch();
  const { selectedDate } = useCalendar();
  const { notes, currentPage, isLoading, error, hasMore, updateNote, deleteNote, togglePinNote, loadNotes } =
    useNotes();
  const loadMoreRef = useRef<HTMLParagraphElement | null>(null);
  const currentPageRef = useRef(currentPage);

  const loadMoreNotes = useCallback(() => {
    loadNotes({ date: selectedDate, query, append: true, page: currentPageRef.current + 1 }).then();
  }, [loadNotes, query, selectedDate]);

  useEffect(() => {
    loadNotes({ date: selectedDate, query }).then();
  }, [loadNotes, query, selectedDate]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    if (!hasMore || isLoading || !loadMoreRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        loadMoreNotes();
      }
    });

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMoreNotes]);

  return (
    <>
      <div className='flex flex-wrap gap-4 justify-center '>
        {notes.map((note) => (
          <div key={note.id} className='w-full max-w-full  sm:max-w-xs'>
            <NoteCard
              content={note.content}
              isPinned={note.isPinned}
              onDelete={() => deleteNote(note.id).then()}
              onPin={() => togglePinNote(note.id).then()}
              onSave={(content) => updateNote(note.id, content).then()}
            />
          </div>
        ))}
      </div>

      <div className='mt-6 flex justify-center'>
        {isLoading && (
          <p className='text-sm text-muted-foreground flex gap-1'>
            <Spinner className={'my-auto'} />
            Loading notes...
          </p>
        )}

        {error && <p className='text-sm text-destructive'>{error}</p>}

        {!isLoading && !error && notes.length === 0 && (
          <p className='text-sm text-muted-foreground'>No notes found.</p>
        )}

        {!isLoading && !error && notes.length > 0 && hasMore && (
          <p ref={loadMoreRef} className='text-sm text-muted-foreground'>
            Load more
          </p>
        )}
      </div>
    </>
  );
};
