'use client';

import { NoteCard } from '@/features/notes/components/note-card.tsx';
import { useNoteSearchStore } from '@/features/notes/store/note-search.ts';
import { NoteListTitle } from '@/features/notes/components/note-list-title.tsx';
import { useNoteDateStore } from '@/features/notes/store/note-date.ts';
import { useNotes } from '@/features/notes/hooks/use-notes.ts';

export const NoteListSection = () => {
  const query = useNoteSearchStore((state) => state.query);
  const selectedDate = useNoteDateStore((state) => state.selectedDate);
  const { notes, isLoading, error, updateNote } = useNotes({ date: selectedDate, query });

  return (
    <>
      <NoteListTitle date={selectedDate} searchValue={query} />

      {isLoading ? <p className='text-sm text-muted-foreground'>Loading notes...</p> : null}
      {error ? <p className='text-sm text-destructive'>{error}</p> : null}

      <div className={'flex gap-2 flex-wrap justify-center'}>
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            content={note.content}
            onSave={(content) => updateNote(note.id, content)}
          />
        ))}
      </div>
    </>
  );
};
