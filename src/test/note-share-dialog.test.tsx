import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NoteShareDialog } from '@/features/notes/components/note-share-dialog';

vi.mock('@/features/notes/hooks/use-note-share.ts', () => ({
  useNoteShare: () => ({
    createNoteShare: vi
      .fn()
      .mockResolvedValue({ shareId: 'share-1', url: 'https://daily.md/share/share-1' }),
  }),
}));

describe('NoteShareDialog', () => {
  it('shows duration presets and creates a share link', async () => {
    const onOpenChange = vi.fn();

    render(<NoteShareDialog content='# Hello' noteId='note-1' onOpenChange={onOpenChange} open />);

    expect(screen.getByText('Share note')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1 hour' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30 days' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '7 days' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create link' }));

    expect(await screen.findByRole('button', { name: 'Create link' })).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
