import { NoteCard } from '@/features/notes/components/note-card.tsx';
import { useNotes } from '@/features/notes/hooks/use-notes.ts';
import { cn } from '@/lib/utils.ts';
import { Spinner } from '@/components/ui/spinner.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useCallback, useEffect } from 'react';
import { useNoteSearchStore } from '@/features/notes/store/note-search.ts';
import { useNoteDateStore } from '@/features/notes/store/note-date.ts';

export const NoteListSection = () => {
  const query = useNoteSearchStore((state) => state.query);
  const selectedDate = useNoteDateStore((state) => state.selectedDate);
  const { notes, currentPage, isLoading, error, hasMore, updateNote, deleteNote, loadNotes } =
    useNotes();

  const loadMoreNotes = useCallback(() => {
    loadNotes({ date: selectedDate, query, append: true, page: currentPage + 1 }).then();
  }, [currentPage, loadNotes, query, selectedDate]);

  useEffect(() => {
    loadNotes({date:selectedDate, query}).then();
  }, [loadNotes, query, selectedDate]);

  return (
    <>
      <div
        className={cn(
          'columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4',
          notes.length === 0 ? 'flex w-full justify-center flex-1 items-center -mt-8' : '',
        )}
      >
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            content={note.content}
            onDelete={() => deleteNote(note.id)}
            onSave={(content) => updateNote(note.id, content)}
          />
        ))}

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
      </div>
      {notes.length > 0 && hasMore && (
        <div className='mt-6 flex justify-center'>
          <Button disabled={isLoading} onClick={() => void loadMoreNotes()} variant='outline'>
            {isLoading ? 'Loading more...' : 'Load more'}
          </Button>
        </div>
      )}
    </>
  );
};
