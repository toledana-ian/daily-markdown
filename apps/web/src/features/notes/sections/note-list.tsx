'use client';

import { NoteCard } from '@/features/notes/components/note-card.tsx';
import { useNoteSearchStore } from '@/features/notes/store/note-search.ts';
import { useNoteDateStore } from '@/features/notes/store/note-date.ts';
import { useNotes } from '@/features/notes/hooks/use-notes.ts';
import { CreateNote } from '@/features/notes/components/create-note.tsx';
import { NoteListTitle } from '@/features/notes/components/note-list-title.tsx';
import { cn } from '@/lib/utils.ts';

export const NoteListSection = () => {
  const query = useNoteSearchStore((state) => state.query);
  const selectedDate = useNoteDateStore((state) => state.selectedDate);
  const { createNote, notes, isLoading, error, updateNote } = useNotes({
    date: selectedDate,
    query,
  });

  return (
    <>
      <div className={'flex justify-center mt-4 mb-2'}>
        <NoteListTitle date={selectedDate} searchValue={query} />
      </div>

      <div className={cn('flex flex-row gap-2 justify-center')}>
        <CreateNote displayText={undefined} onSave={createNote} />

        {/*{isLoading ? <p className='text-sm text-muted-foreground'>Loading notes...</p> : null}*/}
        {/*{error ? <p className='text-sm text-destructive'>{error}</p> : null}*/}
      </div>

      <div
        className={cn(
          'flex flex-wrap gap-2 justify-center mt-3',
          notes.length === 0 ? 'flex-1 items-center -mt-8' : '',
        )}
      >
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            content={note.content}
            onSave={(content) => updateNote(note.id, content)}
          />
        ))}
        {isLoading && <p className='text-sm text-muted-foreground'>Loading notes...</p>}
        {error && <p className='text-sm text-destructive'>{error}</p>}
        {notes.length === 0 && !isLoading && (
          <p className='text-sm text-muted-foreground'>No notes found.</p>
        )}
      </div>
    </>
  );
};
