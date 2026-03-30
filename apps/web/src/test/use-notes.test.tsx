import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNotes } from '@/features/notes/hooks/use-notes.ts';
import { useAuthStore } from '@/features/auth/store/auth.ts';
import { useNotesStore } from '@/features/notes/store/notes.ts';

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}));

vi.mock('@/features/tags/utils/tags.ts', () => ({
  extractTagsFromContent: vi.fn(() => ['updated']),
}));

vi.mock('@/lib/supabase/client.ts', () => ({
  supabase: {
    from: fromMock,
  },
}));

describe('useNotes', () => {
  beforeEach(() => {
    fromMock.mockReset();

    useAuthStore.setState({
      session: {
        user: {
          id: 'user-1',
        },
      } as never,
      loading: false,
    });

    useNotesStore.setState({
      notes: [
        {
          id: 'note-1',
          userId: 'user-1',
          content: 'before',
          createdAt: '2026-03-30T00:00:00.000Z',
          updatedAt: '2026-03-30T00:00:00.000Z',
        },
      ],
      isLoading: false,
      error: null,
      currentPage: 0,
      hasMore: false,
    });
  });

  it('keeps note updates successful when tag sync hits the missing user_id schema error', async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === 'notes') {
        return {
          update: () => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }

      if (table === 'note_tags') {
        return {
          delete: () => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
          insert: vi.fn().mockResolvedValue({
            error: {
              code: '42703',
              message: 'column "user_id" does not exist',
            },
          }),
        };
      }

      if (table === 'tags') {
        return {
          upsert: () => ({
            select: vi.fn().mockResolvedValue({
              data: [{ id: 'tag-1', name: 'updated' }],
              error: null,
            }),
          }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    const { result } = renderHook(() => useNotes());

    await act(async () => {
      await expect(result.current.updateNote('note-1', 'after #updated')).resolves.toBeUndefined();
    });

    expect(useNotesStore.getState().notes[0]?.content).toBe('after #updated');
    expect(useNotesStore.getState().error).toContain('0002_bizarre_prodigy.sql');
  });
});
