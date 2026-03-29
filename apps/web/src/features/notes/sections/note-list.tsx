import { NoteCard } from '@/features/notes/components/note-card.tsx';
import { useNotes } from '@/features/notes/hooks/use-notes.ts';
import { cn } from '@/lib/utils.ts';
import { Spinner } from '@/components/ui/spinner.tsx';
import { useCallback, useEffect, useRef } from 'react';
import { useNoteSearchStore } from '@/features/notes/store/note-search.ts';
import { useNoteDateStore } from '@/features/notes/store/note-date.ts';

export const NoteListSection = () => {
  const query = useNoteSearchStore((state) => state.query);
  const selectedDate = useNoteDateStore((state) => state.selectedDate);
  const { notes, currentPage, isLoading, error, hasMore, updateNote, deleteNote, loadNotes } =
    useNotes();
  const loadMoreRef = useRef<HTMLParagraphElement | null>(null);
  const currentPageRef = useRef(currentPage);

  const loadMoreNotes = useCallback(() => {
    loadNotes({ date: selectedDate, query, append: true, page: currentPageRef.current + 1 }).then();
  }, [loadNotes, query, selectedDate]);

  useEffect(() => {
    loadNotes({ date: selectedDate, query }).then();
  }, [loadNotes, query, selectedDate]);

  useEffect(()=>{currentPageRef.current = currentPage;}, [currentPage])

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
      <div className={cn('columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4')}>
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            content={note.content}
            onDelete={() => deleteNote(note.id).then()}
            onSave={(content) => updateNote(note.id, content)}
          />
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

        {notes.length === 0 && !isLoading && (
          <p className='text-sm text-muted-foreground'>No notes found.</p>
        )}

        {notes.length > 0 && hasMore && !isLoading && (
          <p ref={loadMoreRef} className='text-sm text-muted-foreground'>
            Load more
          </p>
        )}
      </div>
    </>
  );
};
