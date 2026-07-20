import { describe, expect, it } from 'vitest';
import {
  mergeRefreshedNotes,
  NOTES_REFRESH_INTERVAL_MS,
} from '@/features/notes/lib/notes-refresh.ts';
import type { Note } from '@/features/notes/hooks/use-notes.ts';

const createNote = (overrides: Partial<Note> & Pick<Note, 'id'>): Note => ({
  userId: 'user-1',
  content: `content-${overrides.id}`,
  isPinned: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('notes refresh', () => {
  it('uses a five second polling interval', () => {
    expect(NOTES_REFRESH_INTERVAL_MS).toBe(5000);
  });

  it('replaces unprotected notes with fetched server data in server order', () => {
    const existing = [
      createNote({ id: 'a', content: 'stale-a' }),
      createNote({ id: 'b', content: 'stale-b' }),
    ];
    const fetched = [
      createNote({ id: 'c', content: 'fresh-c' }),
      createNote({ id: 'a', content: 'fresh-a' }),
    ];

    expect(mergeRefreshedNotes(existing, fetched, new Set())).toEqual(fetched);
  });

  it('keeps local versions for protected notes while still adding new notes', () => {
    const existing = [
      createNote({ id: 'a', content: 'local-a' }),
      createNote({ id: 'b', content: 'local-b' }),
    ];
    const fetched = [
      createNote({ id: 'c', content: 'fresh-c' }),
      createNote({ id: 'a', content: 'remote-a' }),
      createNote({ id: 'b', content: 'remote-b' }),
    ];

    expect(mergeRefreshedNotes(existing, fetched, new Set(['a']))).toEqual([
      createNote({ id: 'c', content: 'fresh-c' }),
      createNote({ id: 'a', content: 'local-a' }),
      createNote({ id: 'b', content: 'remote-b' }),
    ]);
  });

  it('removes notes deleted remotely unless they are protected', () => {
    const existing = [
      createNote({ id: 'a', content: 'local-a' }),
      createNote({ id: 'b', content: 'local-b' }),
    ];
    const fetched = [createNote({ id: 'b', content: 'remote-b' })];

    expect(mergeRefreshedNotes(existing, fetched, new Set(['a']))).toEqual([
      createNote({ id: 'b', content: 'remote-b' }),
      createNote({ id: 'a', content: 'local-a' }),
    ]);
  });
});
