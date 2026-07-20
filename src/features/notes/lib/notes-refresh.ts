import type { Note } from '@/features/notes/hooks/use-notes.ts';

export const NOTES_REFRESH_INTERVAL_MS = 5000;

export const mergeRefreshedNotes = (
  existing: Note[],
  fetched: Note[],
  protectedIds: ReadonlySet<string>,
): Note[] => {
  const existingById = new Map(existing.map((note) => [note.id, note]));
  const fetchedIds = new Set(fetched.map((note) => note.id));

  const merged = fetched.map((remote) => {
    if (protectedIds.has(remote.id)) {
      return existingById.get(remote.id) ?? remote;
    }

    return remote;
  });

  for (const local of existing) {
    if (protectedIds.has(local.id) && !fetchedIds.has(local.id)) {
      merged.push(local);
    }
  }

  return merged;
};
