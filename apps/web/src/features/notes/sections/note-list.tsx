'use client';

import { NoteCard } from '@/features/notes/components/note-card.tsx';
import { useNoteSearchStore } from '@/features/notes/store/note-search.ts';
import { useNoteDateStore } from '@/features/notes/store/note-date.ts';
import { useNotes } from '@/features/notes/hooks/use-notes.ts';
import { cn } from '@/lib/utils.ts';

export const NoteListSection = () => {
  const query = useNoteSearchStore((state) => state.query);
  const selectedDate = useNoteDateStore((state) => state.selectedDate);
  const { notes, isLoading, error, updateNote, deleteNote } = useNotes({
    date: selectedDate,
    query,
  });

  return (
    <>
      <div
        className={cn(
          'columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4',
          notes.length === 0 ? 'flex-1 items-center -mt-8' : '',
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
        {isLoading && <p className='text-sm text-muted-foreground'>Loading notes...</p>}
        {error && <p className='text-sm text-destructive'>{error}</p>}
        {notes.length === 0 && !isLoading && (
          <p className='text-sm text-muted-foreground'>No notes found.</p>
        )}
      </div>
    </>
  );
};
